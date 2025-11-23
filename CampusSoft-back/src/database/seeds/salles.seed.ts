import { DataSource } from 'typeorm';
import { Salle } from '../../modules/infrastructure/entities/salle.entity';
import { Departement } from '../../modules/infrastructure/entities/departement.entity';
import { RoomType } from '../../common/value-objects/room-type.vo';

/**
 * Seed des salles
 */
export async function seedSalles(dataSource: DataSource): Promise<void> {
  const salleRepository = dataSource.getRepository(Salle);
  const departementRepository = dataSource.getRepository(Departement);

  // Récupérer les départements
  const info = await departementRepository.findOne({ where: { code: 'INFO' } });
  const elec = await departementRepository.findOne({ where: { code: 'ELEC' } });
  const gc = await departementRepository.findOne({ where: { code: 'GC' } });
  const meca = await departementRepository.findOne({ where: { code: 'MECA' } });
  const gest = await departementRepository.findOne({ where: { code: 'GEST' } });

  const salles = [
    // Salles département Informatique
    {
      nom: 'A101',
      capacite: 30,
      type: RoomType.DEPARTEMENT,
      localisation: 'Bâtiment A, 1er étage',
      description: 'Salle de cours équipée de projecteur',
      departementId: info?.id,
    },
    {
      nom: 'A102',
      capacite: 40,
      type: RoomType.DEPARTEMENT,
      localisation: 'Bâtiment A, 1er étage',
      description: 'Salle de cours avec tableau interactif',
      departementId: info?.id,
    },
    {
      nom: 'A201',
      capacite: 25,
      type: RoomType.DEPARTEMENT,
      localisation: 'Bâtiment A, 2ème étage',
      description: 'Salle informatique avec 25 postes',
      departementId: info?.id,
    },
    // Salles département Électronique
    {
      nom: 'B101',
      capacite: 35,
      type: RoomType.DEPARTEMENT,
      localisation: 'Bâtiment B, 1er étage',
      description: 'Laboratoire d\'électronique',
      departementId: elec?.id,
    },
    {
      nom: 'B102',
      capacite: 20,
      type: RoomType.DEPARTEMENT,
      localisation: 'Bâtiment B, 1er étage',
      description: 'Salle de TP électronique',
      departementId: elec?.id,
    },
    // Salles département Génie Civil
    {
      nom: 'C101',
      capacite: 50,
      type: RoomType.DEPARTEMENT,
      localisation: 'Bâtiment C, 1er étage',
      description: 'Amphithéâtre du département',
      departementId: gc?.id,
    },
    // Salles département Mécanique
    {
      nom: 'D101',
      capacite: 30,
      type: RoomType.DEPARTEMENT,
      localisation: 'Bâtiment D, 1er étage',
      description: 'Salle de cours mécanique',
      departementId: meca?.id,
    },
    {
      nom: 'D201',
      capacite: 15,
      type: RoomType.DEPARTEMENT,
      localisation: 'Bâtiment D, 2ème étage',
      description: 'Laboratoire mécanique',
      departementId: meca?.id,
    },
    // Salles département Gestion
    {
      nom: 'E101',
      capacite: 45,
      type: RoomType.DEPARTEMENT,
      localisation: 'Bâtiment E, 1er étage',
      description: 'Salle de cours gestion',
      departementId: gest?.id,
    },
    // Salles mutualisées
    {
      nom: 'AMPHI1',
      capacite: 200,
      type: RoomType.MUTUALISEE,
      localisation: 'Bâtiment central, Rez-de-chaussée',
      description: 'Grand amphithéâtre pour conférences',
      departementId: null,
    },
    {
      nom: 'AMPHI2',
      capacite: 150,
      type: RoomType.MUTUALISEE,
      localisation: 'Bâtiment central, 1er étage',
      description: 'Amphithéâtre moyen',
      departementId: null,
    },
    {
      nom: 'SALLE_MULTI1',
      capacite: 60,
      type: RoomType.MUTUALISEE,
      localisation: 'Bâtiment central, 2ème étage',
      description: 'Salle polyvalente avec équipement audiovisuel',
      departementId: null,
    },
  ];

  for (const salleData of salles) {
    // Valider que le département existe si fourni
    if (salleData.departementId) {
      const departement = await departementRepository.findOne({
        where: { id: salleData.departementId },
      });
      if (!departement) {
        console.log(`⚠️  Département introuvable pour la salle: ${salleData.nom}`);
        continue;
      }
    }

    const existing = await salleRepository.findOne({
      where: { nom: salleData.nom },
    });

    if (!existing) {
      const salle = salleRepository.create(salleData);
      await salleRepository.save(salle);
      console.log(`✅ Salle créée: ${salleData.nom} (${salleData.type})`);
    } else {
      console.log(`⚠️  Salle existante: ${salleData.nom}`);
    }
  }
}

