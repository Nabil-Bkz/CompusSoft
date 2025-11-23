import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Departement } from './departement.entity';
import { RoomType } from '../../../common/value-objects/room-type.vo';

/**
 * Entité Salle - Entity (part of Infrastructure Aggregate)
 * Représente une salle de l'université
 */
@Entity('salles')
export class Salle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'int', nullable: true })
  capacite: number;

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.DEPARTEMENT,
  })
  type: RoomType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  localisation: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true, name: 'departement_id' })
  departementId: string;

  @CreateDateColumn({ type: 'timestamp', name: 'date_creation' })
  dateCreation: Date;

  // Relations
  @ManyToOne(() => Departement, (departement) => departement.salles, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'departement_id' })
  departement: Departement;

  // Domain methods
  /**
   * Vérifie si la salle est mutualisée
   */
  estMutualisee(): boolean {
    return this.type === RoomType.MUTUALISEE;
  }

  /**
   * Vérifie si la salle appartient à un département
   */
  appartientA(departementId: string): boolean {
    return this.departementId === departementId;
  }

  /**
   * Vérifie si la salle appartient au département spécifié
   */
  appartientAuDepartement(departement: Departement): boolean {
    return this.departementId === departement?.id;
  }
}

