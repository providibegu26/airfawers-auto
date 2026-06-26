import EntretienCategoryPage from "../components/Entretiens/EntretienCategoryPage";

const HINT =
  "Les entretiens urgents (≤ 7 jours) sont gérés sur la page Entretiens urgents.";

export default function EntretiensVidange() {
  return (
    <EntretienCategoryPage
      title="Catégorie A — Vidange"
      subtitle="Huile, filtres et contrôle des liquides"
      categoryKey="vidange"
      tableHint={HINT}
      emptyTitle="Aucun entretien de vidange planifié"
    />
  );
}
