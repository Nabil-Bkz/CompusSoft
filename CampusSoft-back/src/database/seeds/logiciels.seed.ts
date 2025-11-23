import { DataSource } from 'typeorm';
import { Logiciel } from '../../modules/software-catalog/entities/logiciel.entity';

/**
 * Seed des logiciels
 */
export async function seedLogiciels(dataSource: DataSource): Promise<void> {
  const logicielRepository = dataSource.getRepository(Logiciel);

  const logiciels = [
    {
      nom: 'Visual Studio Code',
      editeur: 'Microsoft',
      version: '1.85.0',
      usage: 'Édition de code',
      description: 'Éditeur de code source open-source et gratuit',
      dureeMax: 365,
      licence: 'Open Source',
      actif: true,
    },
    {
      nom: 'MATLAB',
      editeur: 'MathWorks',
      version: '2024.1.0',
      usage: 'Calcul numérique et visualisation',
      description: 'Environnement de calcul numérique pour l\'ingénierie et les sciences',
      dureeMax: 365,
      licence: 'Commercial',
      actif: true,
    },
    {
      nom: 'AutoCAD',
      editeur: 'Autodesk',
      version: '2025.0.0',
      usage: 'Dessin assisté par ordinateur',
      description: 'Logiciel de CAO pour le dessin technique et l\'architecture',
      dureeMax: 365,
      licence: 'Commercial',
      actif: true,
    },
    {
      nom: 'SolidWorks',
      editeur: 'Dassault Systèmes',
      version: '2024.0.0',
      usage: 'Conception 3D et CAO',
      description: 'Logiciel de CAO 3D pour la conception mécanique',
      dureeMax: 365,
      licence: 'Commercial',
      actif: true,
    },
    {
      nom: 'Python',
      editeur: 'Python Software Foundation',
      version: '3.12.0',
      usage: 'Programmation',
      description: 'Langage de programmation interprété haut niveau',
      dureeMax: 365,
      licence: 'Open Source',
      actif: true,
    },
    {
      nom: 'IntelliJ IDEA',
      editeur: 'JetBrains',
      version: '2024.1.0',
      usage: 'Développement Java/Kotlin',
      description: 'IDE pour le développement Java, Kotlin et autres langages JVM',
      dureeMax: 365,
      licence: 'Commercial / Community Edition',
      actif: true,
    },
    {
      nom: 'Oracle VirtualBox',
      editeur: 'Oracle',
      version: '7.0.0',
      usage: 'Virtualisation',
      description: 'Logiciel de virtualisation gratuit pour créer des machines virtuelles',
      dureeMax: 365,
      licence: 'Open Source',
      actif: true,
    },
    {
      nom: 'Git',
      editeur: 'Git Project',
      version: '2.43.0',
      usage: 'Gestion de versions',
      description: 'Système de contrôle de versions distribué',
      dureeMax: 365,
      licence: 'Open Source',
      actif: true,
    },
    {
      nom: 'MySQL Workbench',
      editeur: 'Oracle',
      version: '8.0.0',
      usage: 'Gestion de bases de données',
      description: 'Outil de conception et administration de bases de données MySQL',
      dureeMax: 365,
      licence: 'Open Source',
      actif: true,
    },
    {
      nom: 'SPSS Statistics',
      editeur: 'IBM',
      version: '29.0.0',
      usage: 'Analyse statistique',
      description: 'Logiciel d\'analyse statistique pour les sciences sociales et la recherche',
      dureeMax: 365,
      licence: 'Commercial',
      actif: true,
    },
  ];

  for (const logicielData of logiciels) {
    const existing = await logicielRepository.findOne({
      where: {
        nom: logicielData.nom,
        version: logicielData.version,
      },
    });

    if (!existing) {
      const logiciel = logicielRepository.create(logicielData);
      await logicielRepository.save(logiciel);
      console.log(`✅ Logiciel créé: ${logicielData.nom} v${logicielData.version}`);
    } else {
      console.log(`⚠️  Logiciel existant: ${logicielData.nom} v${logicielData.version}`);
    }
  }
}

