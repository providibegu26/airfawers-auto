import EntretienCategoryPage from "../components/Entretiens/EntretienCategoryPage";

const HINT =
  "Les entretiens urgents (≤ 7 jours) sont gérés sur la page Entretiens urgents.";

export default function EntretiensBougies() {
  return (
    <EntretienCategoryPage
      title="Catégorie B — Bougies & freins"
      subtitle="Bougies, plaquettes, amortisseurs"
      categoryKey="categorie_b"
      tableHint={HINT}
      emptyTitle="Aucun entretien catégorie B planifié"
    />
  );
}
