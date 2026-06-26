import React from "react";

/**
 * Conteneur de surface standard : fond blanc, bordure fine, rayon cohérent.
 *  padding: ajoute p-5 (true par défaut)
 *  hover: ombre subtile au survol (pour les cartes cliquables)
 */
const Card = ({
  as: Comp = "div",
  padding = true,
  hover = false,
  className = "",
  children,
  ...props
}) => (
  <Comp
    className={`bg-white border border-slate-200 rounded-xl ${
      padding ? "p-5" : ""
    } ${hover ? "transition-shadow duration-150 hover:shadow-sm" : ""} ${className}`}
    {...props}
  >
    {children}
  </Comp>
);

export default Card;
