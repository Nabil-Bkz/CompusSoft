import { DataSource } from 'typeorm';
import { Logiciel } from '../../modules/software-catalog/entities/logiciel.entity';

/**
 * Seed des logiciels avec logoUrl (réels)
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Matlab_Logo.png',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Autocad_2021_logo.svg',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/SolidWorks_Logo.svg',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/IntelliJ_IDEA_Icon.svg',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Virtualbox_logo.png',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Git-logo.svg',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/MySQL_textlogo.svg',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/97/SPSS_Statistics_Logo.svg',
    },
  ];

  for (const logicielData of logiciels) {
    const existing = await logicielRepository.findOne({
      where: {
        nom: logicielData.nom,
        version: logicielData.version,
      },
    });

    if (existing) {
      // Always update logoUrl for existing logiciels
      existing.logoUrl = logicielData.logoUrl;
      await logicielRepository.save(existing);
      console.log(`🔄 Logiciel mis à jour: ${logicielData.nom} v${logicielData.version}`);
    } else {
      const logiciel = logicielRepository.create(logicielData);
      await logicielRepository.save(logiciel);
      console.log(`✅ Logiciel créé: ${logicielData.nom} v${logicielData.version}`);
    }
  }
}