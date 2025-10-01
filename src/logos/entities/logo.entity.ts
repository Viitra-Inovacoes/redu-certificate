import { Template } from 'src/templates/entities/template.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ManyToOne } from 'typeorm';
import { PrimaryColumn } from 'typeorm';

@Entity({ name: 'logos' })
@Index(['templateId'], { unique: false })
export class Logo {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Template, (template) => template.logos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column('uuid')
  templateId: string;

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

  getSpacesKey() {
    return `templates/${this.templateId}/logos/${this.id}`;
  }
}
