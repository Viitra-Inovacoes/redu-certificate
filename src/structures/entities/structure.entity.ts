import { Client } from 'src/client/entities/client.entity';
import { Template } from 'src/templates/entities/template.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

export enum StructureType {
  ENVIRONMENT = 'environment',
  COURSE = 'course',
  SPACE = 'space',
}

@Entity({ name: 'structures' })
@Index(['clientId', 'structureType', 'structureId'], { unique: true })
export class Structure {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @ManyToOne(() => Client, (client) => client.structures)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column('uuid')
  clientId: string;

  @OneToOne(() => Template, (template) => template.structure)
  template: Template;

  @Column('varchar')
  name: string;

  @Column('enum', { enum: StructureType })
  structureType: StructureType;

  @Column('integer')
  structureId: number;
}
