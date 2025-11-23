import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from './utilisateur.entity';

/**
 * Entité Administrateur - Entity (part of User Management Aggregate)
 * Représente un administrateur de la plateforme
 */
@Entity('administrateurs')
export class Administrateur {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'utilisateur_id' })
  utilisateurId: string;

  // Relation vers Utilisateur
  @OneToOne(
    () => Utilisateur,
    (utilisateur) => utilisateur.administrateur,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;

  // Domain methods
  // Note: Les méthodes métier (configurerPlateforme, etc.) seront implémentées dans le service
}

