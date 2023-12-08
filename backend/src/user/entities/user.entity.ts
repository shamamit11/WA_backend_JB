import { WhatsAppAccount } from 'src/whatsapp/entities/whatsapp-account.entity';
import { WhatsappMessages } from 'src/whatsapp/entities/whatsapp-messages.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne, OneToMany } from 'typeorm';

export enum USER_ROLE {
    ADMIN = 'admin',
    AGENT = 'agent'
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column({ nullable: true })
    middleName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ nullable: true, select: false })
    resetPasswordToken: string;


    @Column({
        type: 'enum',
        enum: USER_ROLE,
        default: USER_ROLE.AGENT
    })
    role: USER_ROLE;

    @Column({ nullable: true })
    whatsappNumber: string;

    @Column({ default: false })
    activeWhatsappSession: boolean;

    @OneToMany(() => WhatsAppAccount, (account) => account.owner)
    contacts: WhatsAppAccount[];

    @OneToMany(() => WhatsappMessages, (message) => message.user)
    messages: WhatsappMessages[];
}
