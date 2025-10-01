import { Blueprint } from 'src/blueprints/entities/blueprint.entity';
import { Certificate } from 'src/certificates/entities/certificate.entity';
import { Logo } from 'src/logos/entities/logo.entity';
import { Signature } from 'src/signatures/entities/signature.entity';
import { Structure } from 'src/structures/entities/structure.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export type S3KeyOptions = {
  kind: S3KeyKind;
  format?: S3KeyFormat;
  preview?: boolean;
};
export type S3KeyKind =
  | 'front'
  | 'back'
  | 'merged'
  | 'frontBackground'
  | 'backBackground';
export type S3KeyFormat = 'html' | 'png' | 'pdf';

export type Grade = { type: GradeType; id?: number; value: number };
export enum GradeType {
  EXERCISE = 'exercise',
  GRADE_GROUP = 'gradeGroup',
  STRUCTURE = 'structure',
}

export type EnrollmentTime = { type: EnrollmentTimeType; value: number };
export enum EnrollmentTimeType {
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
  YEARS = 'years',
}

export type Requirements = {
  afterDate?: Date;
  progress?: number;
  presence?: number;
  enrollmentTime?: EnrollmentTime;
  grade?: Grade;
};

export type Front = {
  title: string;
  organization: string;
  workload: number;
  sumPresenceWorkload: boolean;
  startDate: Date;
  endDate: Date;
  info: string;
};

export enum BackContentType {
  COURSE = 'course',
  SPACE = 'space',
  SUBJECT = 'subject',
  LECTURE = 'lecture',
  CUSTOM = 'custom',
}
export type BackContent =
  | {
      type: BackContentType.CUSTOM;
      value: string;
    }
  | {
      type: Exclude<BackContentType, BackContentType.CUSTOM>;
    };
export type Back = {
  title: string;
  subtitle: string;
  footer: string;
  content: BackContent;
};

export type Metadata = {
  hasBackPage: boolean;
  customBackground: {
    front: boolean;
    back: boolean;
  };
};

@Entity({ name: 'templates' })
@Index(['blueprintId'], { unique: false })
@Index(['structureId'], { unique: true })
export class Template {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Blueprint, (blueprint) => blueprint.templates, {
    nullable: false,
  })
  @JoinColumn({ name: 'blueprintId' })
  blueprint: Blueprint;

  @Column('uuid', { nullable: false })
  blueprintId: string;

  @OneToOne(() => Structure, (structure) => structure.template)
  @JoinColumn({ name: 'structureId' })
  structure: Structure;

  @Column('uuid', { nullable: true })
  structureId: string;

  @Column('boolean', { default: false })
  finished: boolean;

  @Column('boolean', { default: true })
  generationEnabled: boolean;

  @Column('varchar', { nullable: true })
  downloadButtonLabel?: string;

  @OneToMany(() => Certificate, (certificate) => certificate.template)
  certificates: Certificate[];

  @OneToMany(() => Signature, (signature) => signature.template)
  signatures: Signature[];

  @OneToMany(() => Logo, (logo) => logo.template)
  logos: Logo[];

  @Column('jsonb', { nullable: true })
  front: Front;

  @Column('jsonb', { nullable: true })
  back: Back;

  @Column('jsonb', { nullable: true })
  requirements: Requirements;

  @Column('jsonb', { nullable: true })
  metadata: Metadata;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'now()',
    onUpdate: 'now()',
  })
  updatedAt: Date;

  get folderKey() {
    return `templates/${this.id}`;
  }

  getS3Key({ kind, format, preview = false }: S3KeyOptions) {
    const _preview = preview ? 'preview/' : '';
    const _format = format ? `.${format}` : '';
    return `${this.folderKey}/${_preview}${kind}${_format}`;
  }
}
