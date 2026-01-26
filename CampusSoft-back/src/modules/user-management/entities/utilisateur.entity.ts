import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserRole } from '../../../common/value-objects/user-role.vo';
import { canCreateDemande } from '../../../common/value-objects/user-role.vo';
import { Enseignant } from './enseignant.entity';
import { ServiceInformatique } from './service-informatique.entity';
import { Administrateur } from './administrateur.entity';

/**
 * Entité Utilisateur - Aggregate Root
 * Représente un utilisateur du système
 */
@Entity('utilisateurs')
export class Utilisateur {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  nom: string;

  @Column({ type: 'varchar', length: 255 })
  prenom: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'sso_id' })
  ssoId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ENSEIGNANT,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp', name: 'date_creation' })
  dateCreation: Date;

  @Column({ type: 'boolean', default: true })
  actif: boolean;

  // Relations vers entités spécialisées (OneToOne optionnel)
  // Relations inverses : la clé étrangère est dans les entités spécialisées
  @OneToOne(() => Enseignant, (enseignant) => enseignant.utilisateur, {
    nullable: true,
  })
  enseignant?: Enseignant;

  @OneToOne(
    () => ServiceInformatique,
    (serviceInformatique) => serviceInformatique.utilisateur,
    {
      nullable: true,
    },
  )
  serviceInformatique?: ServiceInformatique;

  @OneToOne(
    () => Administrateur,
    (administrateur) => administrateur.utilisateur,
    {
      nullable: true,
    },
  )
  administrateur?: Administrateur;

  // Domain methods
  /**
   * Vérifie si l'utilisateur peut créer une demande
   */
  peutCreerDemande(): boolean {
    return canCreateDemande(this.role);
  }

  /**
   * Vérifie si l'utilisateur peut consulter toutes les demandes
   */
  peutConsulterToutesDemandes(): boolean {
    return (
      this.role === UserRole.SERVICE_INFORMATIQUE ||
      this.role === UserRole.ADMINISTRATEUR
    );
  }

  /**
   * Retourne le nom complet
   */
  obtenirNomComplet(): string {
    return `${this.prenom} ${this.nom}`;
  }
}

