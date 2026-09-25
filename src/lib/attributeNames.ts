/** Web attribute id -> internal (data) attribute name. */
export const ATTRIBUTE_ID_TO_INTERNAL: Record<string, string> = {
  acceleration: "Aceleracion",
  sprint_speed: "Sprint",
  att_position: "Posicionamiento",
  finishing: "Definicion",
  shot_power: "Potencia Tiro",
  long_shots: "Tiros Lejanos",
  volleys: "Voleas",
  penalties: "Penales",
  vision: "Vision",
  crossing: "Centros",
  fk_accuracy: "Precision TL",
  short_passing: "Pase Corto",
  long_passing: "Pase Largo",
  curve: "Efecto",
  agility: "Agilidad",
  balance: "Balance",
  reactions: "Reacciones",
  ball_control: "Control Balon",
  dribbling: "Regates",
  composure: "Compostura",
  interceptions: "Intercepciones",
  heading_acc: "Precision Cabeza",
  def_aware: "Percepcion Defensiva",
  standing_tackle: "Robos",
  sliding_tackle: "Barridas",
  jumping: "Salto",
  stamina: "Resistencia",
  strength: "Fuerza",
  aggression: "Agresividad",
  gk_diving: "GK_Estirada",
  gk_handling: "GK_Paradas",
  gk_kicking: "GK_Saque",
  gk_reflexes: "GK_Reflejos",
  gk_positioning: "GK_Colocacion",
};

/** Internal (data) attribute name -> display (English) name. */
export const ATTRIBUTE_NAME_TO_EN: Record<string, string> = {
  Aceleracion: "Acceleration",
  Sprint: "Sprint Speed",
  Posicionamiento: "Att. Position",
  Definicion: "Finishing",
  "Potencia Tiro": "Shot Power",
  "Tiros Lejanos": "Long Shots",
  Voleas: "Volleys",
  Penales: "Penalties",
  Vision: "Vision",
  Centros: "Crossing",
  "Precision TL": "FK Accuracy",
  "Pase Corto": "Short Passing",
  "Pase Largo": "Long Passing",
  Efecto: "Curve",
  Agilidad: "Agility",
  Balance: "Balance",
  Reacciones: "Reactions",
  "Control Balon": "Ball Control",
  Regates: "Dribbling",
  Compostura: "Composure",
  Intercepciones: "Interceptions",
  "Precision Cabeza": "Heading Accuracy",
  "Percepcion Defensiva": "Def. Awareness",
  Robos: "Standing Tackle",
  Barridas: "Sliding Tackle",
  Salto: "Jumping",
  Resistencia: "Stamina",
  Fuerza: "Strength",
  Agresividad: "Aggression",
  GK_Estirada: "GK Diving",
  GK_Paradas: "GK Handling",
  GK_Saque: "GK Kicking",
  GK_Reflejos: "GK Reflexes",
  GK_Colocacion: "GK Positioning",
};

/** Web stat id -> English display label. */
export const attributeLabel = (id: string): string => {
  const internal = ATTRIBUTE_ID_TO_INTERNAL[id];
  return internal ? ATTRIBUTE_NAME_TO_EN[internal] ?? internal : id;
};

/** Internal (data) attribute name -> English display label. */
export const attributeNameToEn = (name: string): string =>
  ATTRIBUTE_NAME_TO_EN[name] ?? name;