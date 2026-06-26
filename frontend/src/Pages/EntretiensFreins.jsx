import EntretienCategoryPage from "../components/Entretiens/EntretienCategoryPage";

const HINT =
  "Les entretiens urgents (≤ 7 jours) sont gérés sur la page Entretiens urgents.";

export default function EntretiensFreins() {
  return (
    <EntretienCategoryPage
      title="Catégorie C — Freins & suspensions"
      subtitle="Suspensions, pneus et composants majeurs"
      categoryKey="categorie_c"
      tableHint={HINT}
      emptyTitle="Aucun entretien catégorie C planifié"
    />
  );
}
