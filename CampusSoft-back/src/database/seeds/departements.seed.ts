import { DataSource } from 'typeorm';
import { Departement } from '../../modules/infrastructure/entities/departement.entity';

/**
 * Seed des départements
 */
export async function seedDepartements(dataSource: DataSource): Promise<void> {
  const departementRepository = dataSource.getRepository(Departement);

  const departements = [
    {
      nom: 'Informatique',
      code: 'INFO',
      description: 'Département d\'informatique et de mathématiques appliquées',
    },
    {
      nom: 'Électronique',
      code: 'ELEC',
      description: 'Département d\'électronique et d\'automatique',
    },
    {
      nom: 'Génie Civil',
      code: 'GC',
      description: 'Département de génie civil et d\'architecture',
    },
    {
      nom: 'Mécanique',
      code: 'MECA',
      description: 'Département de mécanique et d\'ingénierie des matériaux',
    },
    {
      nom: 'Gestion',
      code: 'GEST',
      description: 'Département de gestion et de management',
    },
  ];

  for (const deptData of departements) {
    const existing = await departementRepository.findOne({
      where: { code: deptData.code },
    });

    if (!existing) {
      const departement = departementRepository.create(deptData);
      await departementRepository.save(departement);
      console.log(`✅ Département créé: ${deptData.nom} (${deptData.code})`);
    } else {
      console.log(`⚠️  Département existant: ${deptData.nom} (${deptData.code})`);
    }
  }
}

