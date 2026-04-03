"""Batch processing scheduler for periodic model inference and analysis."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, time
from typing import Callable, Coroutine

logger = logging.getLogger(__name__)


class BatchJobScheduler:
    """Simple scheduler for periodic batch processing jobs."""

    def __init__(self):
        self.jobs: dict[str, BatchJob] = {}
        self.running = False
        self._task: asyncio.Task[None] | None = None

    def register_job(
        self,
        job_id: str,
        func: Callable[[], Coroutine],
        interval_seconds: int = 3600,
        run_at_time: time | None = None,
    ) -> None:
        """Register a periodic job.
        
        Args:
            job_id: Unique job identifier
            func: Async function to execute
            interval_seconds: Interval between executions (default: 1 hour)
            run_at_time: Specific time to run (e.g., time(2, 0) for 2 AM)
        """
        self.jobs[job_id] = BatchJob(
            job_id=job_id,
            func=func,
            interval_seconds=interval_seconds,
            run_at_time=run_at_time,
        )
        logger.info(f"Registered batch job: {job_id}")

    def unregister_job(self, job_id: str) -> None:
        """Unregister a job."""
        if job_id in self.jobs:
            del self.jobs[job_id]
            logger.info(f"Unregistered batch job: {job_id}")

    async def start(self) -> None:
        """Start the scheduler."""
        self.running = True
        logger.info("Batch scheduler started")
        self._task = asyncio.create_task(self._run_loop())

    async def stop(self) -> None:
        """Stop the scheduler."""
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Batch scheduler stopped")

    async def _run_loop(self) -> None:
        """Main scheduler loop."""
        while self.running:
            now = datetime.utcnow()
            current_time = now.time()

            for job_id, job in self.jobs.items():
                if job.should_run(now):
                    await self._execute_job(job)

            # Sleep briefly to avoid busy-waiting
            await asyncio.sleep(60)  # Check every minute

    async def _execute_job(self, job: BatchJob) -> None:
        """Execute a job with error handling."""
        try:
            logger.info(f"Executing batch job: {job.job_id}")
            await job.func()
            job.last_run = datetime.utcnow()
            logger.info(f"Completed batch job: {job.job_id}")
        except Exception as e:
            logger.error(f"Error in batch job {job.job_id}: {str(e)}", exc_info=True)


class BatchJob:
    """Represents a periodic batch job."""

    def __init__(
        self,
        job_id: str,
        func: Callable[[], Coroutine],
        interval_seconds: int = 3600,
        run_at_time: time | None = None,
    ):
        self.job_id = job_id
        self.func = func
        self.interval_seconds = interval_seconds
        self.run_at_time = run_at_time
        self.last_run: datetime | None = None

    def should_run(self, current_time: datetime) -> bool:
        """Determine if job should run now."""
        if self.last_run is None:
            # First run
            return True

        # Check interval
        elapsed = (current_time - self.last_run).total_seconds()
        if elapsed < self.interval_seconds:
            return False

        # If specific time is set, check if current time matches
        if self.run_at_time:
            current_t = current_time.time()
            # Allow 1-minute window
            return (
                current_t.hour == self.run_at_time.hour
                and current_t.minute == self.run_at_time.minute
            )

        return True


# Global scheduler instance
_scheduler = BatchJobScheduler()


def get_scheduler() -> BatchJobScheduler:
    """Get the global batch scheduler."""
    return _scheduler


async def start_scheduler() -> None:
    """Start the global scheduler."""
    await _scheduler.start()


async def stop_scheduler() -> None:
    """Stop the global scheduler."""
    await _scheduler.stop()
