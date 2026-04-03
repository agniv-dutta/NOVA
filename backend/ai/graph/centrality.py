"""Network centrality and influence analysis."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class CentralityScores:
    """Centrality metrics for a node in the network."""
    node_id: str
    degree_centrality: float  # 0-1: how many connections
    betweenness_centrality: float  # 0-1: bridge position in network
    closeness_centrality: float  # 0-1: average distance to others
    eigenvector_centrality: float  # 0-1: influence through important connections
    influence_score: float  # 0-1: composite influence metric


class NetworkAnalyzer:
    """Analyze team networks for burnout propagation and influence."""

    def __init__(self):
        self.adjacency_matrix: dict[str, set[str]] = {}
        self.weights: dict[tuple[str, str], float] = {}  # interaction frequency weights

    def add_edge(
        self,
        from_node: str,
        to_node: str,
        weight: float = 1.0,
    ) -> None:
        """Add an edge representing interaction between employees."""
        if from_node not in self.adjacency_matrix:
            self.adjacency_matrix[from_node] = set()
        if to_node not in self.adjacency_matrix:
            self.adjacency_matrix[to_node] = set()

        self.adjacency_matrix[from_node].add(to_node)
        self.adjacency_matrix[to_node].add(from_node)  # Undirected

        # Store weight (e.g., meeting frequency)
        self.weights[(from_node, to_node)] = weight
        self.weights[(to_node, from_node)] = weight

    def get_degree_centrality(self, node_id: str) -> float:
        """Compute degree centrality: fraction of nodes connected to this node."""
        if node_id not in self.adjacency_matrix:
            return 0.0

        neighbors = len(self.adjacency_matrix[node_id])
        total_nodes = len(self.adjacency_matrix)

        if total_nodes <= 1:
            return 0.0

        return neighbors / (total_nodes - 1)

    def get_betweenness_centrality(self, node_id: str) -> float:
        """Compute betweenness centrality: fraction of shortest paths through this node.
        
        Approximation: count how many node pairs would have this node as bridge.
        Full implementation would require shortest path calculation.
        """
        if node_id not in self.adjacency_matrix:
            return 0.0

        neighbors = self.adjacency_matrix[node_id]
        if len(neighbors) < 2:
            return 0.0

        # Simplified: ratio of potential bridges
        total_pairs = len(self.adjacency_matrix) * (len(self.adjacency_matrix) - 1) / 2
        if total_pairs == 0:
            return 0.0

        # Heuristic: nodes with many neighbors are likely bridges
        max_possible_bridges = len(neighbors) * (len(neighbors) - 1) / 2
        return min(max_possible_bridges / total_pairs, 1.0)

    def get_closeness_centrality(self, node_id: str) -> float:
        """Compute closeness centrality: inverse of average distance to all other nodes.
        
        Approximation: use hop distance based on BFS.
        """
        if node_id not in self.adjacency_matrix:
            return 0.0

        total_distance = 0
        visited = set()
        queue = [(node_id, 0)]

        while queue:
            current, distance = queue.pop(0)
            if current in visited:
                continue
            visited.add(current)
            total_distance += distance

            for neighbor in self.adjacency_matrix.get(current, set()):
                if neighbor not in visited:
                    queue.append((neighbor, distance + 1))

        reachable = len(visited) - 1  # exclude self
        if reachable == 0:
            return 0.0

        avg_distance = total_distance / reachable
        # Invert: closer = higher centrality
        return 1.0 / (1.0 + avg_distance)

    def get_eigenvector_centrality(self, node_id: str, iterations: int = 10) -> float:
        """Compute eigenvector centrality: influence through important connections.
        
        Power iteration approximation.
        """
        if node_id not in self.adjacency_matrix:
            return 0.0

        # Initialize scores uniformly
        scores = {node: 1.0 for node in self.adjacency_matrix}

        # Power iteration
        for _ in range(iterations):
            new_scores = {}
            for node in self.adjacency_matrix:
                neighbors = self.adjacency_matrix[node]
                new_scores[node] = sum(scores.get(n, 0) for n in neighbors)

            # Normalize
            total = sum(new_scores.values())
            if total > 0:
                scores = {node: score / total for node, score in new_scores.items()}
            else:
                scores = new_scores

        return min(scores.get(node_id, 0.0), 1.0)

    def compute_centrality(self, node_id: str) -> CentralityScores:
        """Compute all centrality metrics for a node."""
        degree = self.get_degree_centrality(node_id)
        betweenness = self.get_betweenness_centrality(node_id)
        closeness = self.get_closeness_centrality(node_id)
        eigenvector = self.get_eigenvector_centrality(node_id)

        # Composite influence score (weighted average)
        influence_score = (
            0.25 * degree
            + 0.30 * betweenness
            + 0.25 * closeness
            + 0.20 * eigenvector
        )

        return CentralityScores(
            node_id=node_id,
            degree_centrality=degree,
            betweenness_centrality=betweenness,
            closeness_centrality=closeness,
            eigenvector_centrality=eigenvector,
            influence_score=influence_score,
        )

    def compute_all_centralities(self) -> dict[str, CentralityScores]:
        """Compute centrality for all nodes."""
        return {
            node_id: self.compute_centrality(node_id)
            for node_id in self.adjacency_matrix
        }

    def get_isolated_nodes(self, threshold: float = 0.1) -> list[str]:
        """Find isolated or nearly-isolated nodes (low degree centrality)."""
        return [
            node_id
            for node_id, centrality in self.compute_all_centralities().items()
            if centrality.degree_centrality < threshold
        ]

    def calculate_collaboration_entropy(self, node_id: str) -> float:
        """Calculate entropy of collaboration patterns.
        
        High entropy = distributed interactions; Low entropy = concentrated interactions.
        Range: 0-1
        """
        if node_id not in self.adjacency_matrix:
            return 0.0

        neighbors = list(self.adjacency_matrix[node_id])
        if not neighbors:
            return 0.0

        # Get weights for each connection
        weights = [
            self.weights.get((node_id, n), 1.0) for n in neighbors
        ]
        total_weight = sum(weights)

        if total_weight == 0:
            return 0.0

        # Normalize weights to probabilities
        probabilities = [w / total_weight for w in weights]

        # Calculate Shannon entropy
        import math
        entropy = -sum(p * math.log2(p + 1e-10) for p in probabilities)

        # Normalize by max possible entropy (uniform distribution)
        max_entropy = math.log2(len(neighbors)) if len(neighbors) > 1 else 0
        if max_entropy == 0:
            return 0.0

        return min(entropy / max_entropy, 1.0)

    def get_interaction_frequency(self, from_node: str, to_node: str) -> float:
        """Get interaction frequency between two nodes."""
        return self.weights.get((from_node, to_node), 0.0)

    def get_response_latency_trend(
        self,
        node_id: str,
        latencies: list[tuple[str, float]],
    ) -> float:
        """Compute average response latency trend (seconds).
        
        Args:
            node_id: Employee ID
            latencies: List of (peer_id, latency_seconds)
        
        Returns:
            Average response latency (0-1 normalized, where 0 = very fast, 1 = very slow)
        """
        if not latencies:
            return 0.5

        # Typical response latency: 0-3600 seconds (1 hour)
        avg_latency = sum(l for _, l in latencies) / len(latencies)
        return min(avg_latency / 3600.0, 1.0)

    def estimate_burnout_propagation_risk(
        self,
        node_id: str,
        node_risk_score: float,
        neighbor_risk_scores: dict[str, float],
    ) -> float:
        """Estimate risk of burnout spreading through network.
        
        Factors considered:
        - Node's own risk score
        - Neighbors' risk scores
        - Network influence (centrality)
        - Interaction frequency
        
        Returns: Propagation risk (0-1)
        """
        if node_id not in self.adjacency_matrix:
            return node_risk_score

        centrality = self.compute_centrality(node_id)
        neighbors = self.adjacency_matrix[node_id]

        if not neighbors:
            return node_risk_score

        # Average neighbor risk
        neighbor_risks = [
            neighbor_risk_scores.get(n, 0.0) for n in neighbors
        ]
        avg_neighbor_risk = sum(neighbor_risks) / len(neighbor_risks)

        # Weight by interaction frequency
        weighted_neighbor_risk = sum(
            neighbor_risk_scores.get(n, 0.0) * self.weights.get((node_id, n), 1.0)
            for n in neighbors
        ) / (sum(self.weights.get((node_id, n), 1.0) for n in neighbors) or 1.0)

        # Propagation model: contagion increases with network influence
        propagation_risk = (
            0.4 * node_risk_score  # Own risk
            + 0.3 * weighted_neighbor_risk  # Neighbor influence
            + 0.2 * centrality.influence_score * avg_neighbor_risk  # Network effect
            + 0.1 * centrality.degree_centrality  # Degree effect
        )

        return min(propagation_risk, 1.0)
