// whatsapp/entities/whatsapp-session.entity.ts

import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WhatsAppAccount } from './whatsapp-account.entity';

@Entity()
export class WhatsappMessages {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column()
    body: string;

    @ManyToOne(() => WhatsAppAccount, (account) => account.messages)
    client: WhatsAppAccount;

    @Column({ default: 'in' })
    type: string;

    @Column()
    messageTimestamp: number;

    @ManyToOne(() => User, user => user.messages, { cascade: [ 'remove' ] })
    @JoinColumn()
    user: User;
}
