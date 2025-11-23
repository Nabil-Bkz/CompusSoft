import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Utilisateur } from './utilisateur.entity';

/**
 * Entité Enseignant - Entity (part of User Management Aggregate)
 * Représente un enseignant
 */
@Entity('enseignants')
export class Enseignant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'utilisateur_id' })
  utilisateurId: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'numero_employe' })
  numeroEmploye: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bureau: string;

  // Relation vers Utilisateur
  @OneToOne(() => Utilisateur, (utilisateur) => utilisateur.enseignant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;

  // Domain methods
  // Note: Les méthodes métier (créerDemande, etc.) seront implémentées dans le service
  // car elles nécessitent des dépendances vers d'autres modules
}

