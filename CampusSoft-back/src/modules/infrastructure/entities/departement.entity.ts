import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Salle } from './salle.entity';

/**
 * Entité Département - Aggregate Root
 * Représente un département de l'université
 */
@Entity('departements')
export class Departement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nom: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', name: 'date_creation' })
  dateCreation: Date;

  // Relations
  @OneToMany(() => Salle, (salle) => salle.departement, { cascade: true })
  salles: Salle[];

  // Domain methods
  /**
   * Obtient la liste des salles du département
   */
  obtenirSalles(): Salle[] {
    return this.salles || [];
  }

  /**
   * Vérifie si le département possède une salle
   */
  possedeSalle(salleId: string): boolean {
    return this.obtenirSalles().some((s) => s.id === salleId);
  }
}

