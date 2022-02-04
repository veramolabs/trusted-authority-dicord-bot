// Core interfaces
import { createAgent, IDIDManager, IKeyManager } from '@veramo/core'

// Core identity manager plugin
import { DIDManager } from '@veramo/did-manager'

// Ethr did identity provider
import { EthrDIDProvider } from '@veramo/did-provider-ethr'

// Core key manager plugin
import { KeyManager } from '@veramo/key-manager'

// Key management system plugin
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'

// W3C Verifiable Credential issuance plugin
import { CredentialIssuer, ICredentialIssuer } from '@veramo/credential-w3c'

// Storage plugin using TypeOrm
import { Entities, KeyStore, DIDStore, PrivateKeyStore, migrations } from '@veramo/data-store'

// TypeORM is installed with `@veramo/data-store`
import { createConnection } from 'typeorm'

// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = 'database.sqlite'

// You will need to get a project ID from infura https://www.infura.io
export const INFURA_PROJECT_ID = '6fffe7dc6c6c42459d5443592d3c3afc'

const KMS_SECRET_KEY = '8e69cda5e49a2fdb523eea49c4a282ea5a7acc82a63493b276ec99ed2aab05c2'

const dbConnection = createConnection({
  type: 'sqlite',
  database: DATABASE_FILE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ['error', 'info', 'warn'],
  entities: Entities,
})

export const issuanceAgent = createAgent<IDIDManager & IKeyManager & ICredentialIssuer>({
  plugins: [
    new CredentialIssuer(),
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: 'did:ethr:rinkeby',
      providers: {
        'did:ethr:rinkeby': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'rinkeby',
          rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
        }),
      },
    }),
  ],
})
