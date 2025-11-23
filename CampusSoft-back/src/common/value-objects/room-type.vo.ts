/**
 * Value Object: RoomType
 * Type de salle selon le MCD
 */
export enum RoomType {
  DEPARTEMENT = 'département',
  MUTUALISEE = 'mutualisée',
}

/**
 * Valide qu'un type de salle est valide
 */
export function isValidRoomType(type: string): type is RoomType {
  return Object.values(RoomType).includes(type as RoomType);
}

