import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Blueprint } from '../../blueprints/entities/blueprint.entity';
import { Structure } from 'src/structures/entities/structure.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'clients' })
export class Client {
  @PrimaryColumn('uuid', { default: () => 'uuidv7()' })
  id: string;

  @Column('varchar', { unique: true })
  name: string;

  @ManyToOne(() => Blueprint, (blueprint) => blueprint.clients)
  @JoinColumn({ name: 'blueprintId' })
  blueprint: Blueprint;

  @OneToMany(() => Structure, (structure) => structure.client)
  structures: Structure[];

  @OneToMany(() => User, (user) => user.client)
  users: User[];
}
