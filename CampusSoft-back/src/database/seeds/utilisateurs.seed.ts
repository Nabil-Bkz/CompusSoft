import { DataSource } from 'typeorm';
import { Utilisateur } from '../../modules/user-management/entities/utilisateur.entity';
import { Enseignant } from '../../modules/user-management/entities/enseignant.entity';
import { ServiceInformatique } from '../../modules/user-management/entities/service-informatique.entity';
import { Administrateur } from '../../modules/user-management/entities/administrateur.entity';
import { UserRole } from '../../common/value-objects/user-role.vo';

/**
 * Seed des utilisateurs
 */
export async function seedUtilisateurs(dataSource: DataSource): Promise<void> {
  const utilisateurRepository = dataSource.getRepository(Utilisateur);
  const enseignantRepository = dataSource.getRepository(Enseignant);
  const serviceInformatiqueRepository = dataSource.getRepository(ServiceInformatique);
  const administrateurRepository = dataSource.getRepository(Administrateur);

  // Enseignants
  const enseignants = [
    {
      utilisateur: {
        email: 'ahmed.benali@university.edu',
        nom: 'Benali',
        prenom: 'Ahmed',
        role: UserRole.ENSEIGNANT,
        actif: true,
      },
      enseignant: {
        numeroEmploye: 'EMP001',
        bureau: 'Bâtiment A, Bureau 201',
      },
    },
    {
      utilisateur: {
        email: 'fatima.aloui@university.edu',
        nom: 'Aloui',
        prenom: 'Fatima',
        role: UserRole.ENSEIGNANT,
        actif: true,
      },
      enseignant: {
        numeroEmploye: 'EMP002',
        bureau: 'Bâtiment A, Bureau 202',
      },
    },
    {
      utilisateur: {
        email: 'mohammed.tazi@university.edu',
        nom: 'Tazi',
        prenom: 'Mohammed',
        role: UserRole.ENSEIGNANT,
        actif: true,
      },
      enseignant: {
        numeroEmploye: 'EMP003',
        bureau: 'Bâtiment B, Bureau 101',
      },
    },
    {
      utilisateur: {
        email: 'sanae.idrissi@university.edu',
        nom: 'Idrissi',
        prenom: 'Sanae',
        role: UserRole.ENSEIGNANT,
        actif: true,
      },
      enseignant: {
        numeroEmploye: 'EMP004',
        bureau: 'Bâtiment C, Bureau 301',
      },
    },
  ];

  for (const { utilisateur: userData, enseignant: enseignantData } of enseignants) {
    let existingUser = await utilisateurRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      existingUser = utilisateurRepository.create(userData);
      existingUser = await utilisateurRepository.save(existingUser);
      console.log(`✅ Utilisateur créé: ${userData.prenom} ${userData.nom} (${userData.email})`);
    }

    // Créer l'enseignant
    const existingEnseignant = await enseignantRepository.findOne({
      where: { utilisateurId: existingUser.id },
    });

    if (!existingEnseignant) {
      const enseignant = enseignantRepository.create({
        utilisateurId: existingUser.id,
        ...enseignantData,
      });
      await enseignantRepository.save(enseignant);
      console.log(`✅ Enseignant créé: ${userData.prenom} ${userData.nom} (${enseignantData.numeroEmploye})`);
    }
  }

  // Service Informatique
  const serviceIT = [
    {
      email: 'it.support@university.edu',
      nom: 'Support',
      prenom: 'IT',
      role: UserRole.SERVICE_INFORMATIQUE,
      actif: true,
    },
    {
      email: 'admin.it@university.edu',
      nom: 'Admin',
      prenom: 'IT',
      role: UserRole.SERVICE_INFORMATIQUE,
      actif: true,
    },
  ];

  for (const userData of serviceIT) {
    let existingUser = await utilisateurRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      existingUser = utilisateurRepository.create(userData);
      existingUser = await utilisateurRepository.save(existingUser);
      console.log(`✅ Utilisateur créé: ${userData.prenom} ${userData.nom} (${userData.email})`);
    }

    // Créer le membre du service informatique
    const existingServiceIT = await serviceInformatiqueRepository.findOne({
      where: { utilisateurId: existingUser.id },
    });

    if (!existingServiceIT) {
      const serviceIT = serviceInformatiqueRepository.create({
        utilisateurId: existingUser.id,
      });
      await serviceInformatiqueRepository.save(serviceIT);
      console.log(`✅ Service Informatique créé: ${userData.prenom} ${userData.nom}`);
    }
  }

  // Administrateur
  const adminData = {
    utilisateur: {
      email: 'admin@university.edu',
      nom: 'Administrator',
      prenom: 'System',
      role: UserRole.ADMINISTRATEUR,
      actif: true,
    },
  };

  let existingAdminUser = await utilisateurRepository.findOne({
    where: { email: adminData.utilisateur.email },
  });

  if (!existingAdminUser) {
    existingAdminUser = utilisateurRepository.create(adminData.utilisateur);
    existingAdminUser = await utilisateurRepository.save(existingAdminUser);
    console.log(`✅ Utilisateur créé: ${adminData.utilisateur.prenom} ${adminData.utilisateur.nom}`);

    const administrateur = administrateurRepository.create({
      utilisateurId: existingAdminUser.id,
    });
    await administrateurRepository.save(administrateur);
    console.log(`✅ Administrateur créé: ${adminData.utilisateur.prenom} ${adminData.utilisateur.nom}`);
  }
}

