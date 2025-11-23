import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from './utilisateur.entity';

/**
 * Entité ServiceInformatique - Entity (part of User Management Aggregate)
 * Représente un membre du service informatique
 */
@Entity('service_informatique')
export class ServiceInformatique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'utilisateur_id' })
  utilisateurId: string;

  // Relation vers Utilisateur
  @OneToOne(
    () => Utilisateur,
    (utilisateur) => utilisateur.serviceInformatique,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;

  // Domain methods
  // Note: Les méthodes métier (traiterDemande, etc.) seront implémentées dans le service
  // car elles nécessitent des dépendances vers d'autres modules
}

