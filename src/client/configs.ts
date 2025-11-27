export type ClientConfig = {
  baseUrl: string;
  appKey: string;
};

export type ClientKey =
  | 'development'
  | 'avamec'
  | 'avamec-homolog'
  | 'avaviitra'
  | 'conectamaisedu'
  | 'editoradc'
  | 'estartec'
  | 'fps'
  | 'homolog'
  | 'horus'
  | 'invar'
  | 'malunaescola'
  | 'martorelli'
  | 'microkids'
  | 'movimenta'
  | 'munera'
  | 'redudigital'
  | 'saberes'
  | 'siao'
  | 'somos';

export const configs: Record<ClientKey, ClientConfig> = {
  development: {
    baseUrl: 'http://localhost:3000/api',
    appKey: 'bmerE6W7teWF09nHOhEBh7ozabiR2c0X4embxXiBASU',
  },
  avamec: {
    baseUrl: 'https://api.avamecinterativo.mec.gov.br/api',
    appKey: 'dn2YYVMyYDda0kxw2ggbhKvE18i2WTg4Azvd472r',
  },
  'avamec-homolog': {
    baseUrl: 'https://api-avamecinterativo.cin.ufpe.br/api',
    appKey: 'bmerE6W7teWF09nHOhEBh7ozabiR2c0X4embxXiBASU',
  },
  avaviitra: {
    // baseUrl: 'https://ava.viitra.in/api',
    baseUrl: 'http://localhost:3000/api',
    appKey: 'bmerE6W7teWF09nHOhEBh7ozabiR2c0X4embxXiBASU',
  },
  conectamaisedu: {
    baseUrl: 'https://api.conectamaisedu.com.br/api',
    appKey: '1rEd7O6H2saePDWcryf1r2oR95SqM5PtXi90GTTxoniw',
  },
  editoradc: {
    baseUrl: 'https://api.editoradc.redu.digital/api',
    appKey: 'ZbxMHmLzmQfDhV1ki3SyyGozSvu1qWmR24M6Il1uB8ur',
  },
  estartec: {
    baseUrl: 'https://digital.estartec.net/api',
    appKey: 'Kpq4RUxOrQPWZ5fLy7DR5E4GirDaaUquHe9egxXtdzU',
  },
  fps: {
    baseUrl: 'https://api.fps.redu.digital/api',
    appKey: '8L4AezGS1u414dS5wGHKCkqVDH36sieihVlxaZmebBWg',
  },
  homolog: {
    baseUrl: 'https://api-avamecinterativo.cin.ufpe.br/api',
    appKey: 'bmerE6W7teWF09nHOhEBh7ozabiR2c0X4embxXiBASU',
  },
  horus: {
    baseUrl: 'https://api.horus.redu.digital/api',
    appKey: 'fohghea0voh5keimeeroobuuWiZiebahyohm7Sheeh3a',
  },
  invar: {
    baseUrl: 'https://api.invar.redu.digital/api',
    appKey: 'ddc6DKpqtxZLHbsAoCYaF6mxVLlj24DEf1EFv5Nirxbz',
  },
  malunaescola: {
    baseUrl: 'https://api.malunaescola.redu.digital/api',
    appKey: 'AA52sG8T0QMj56DIGQXnhzbvLxmVThQqobiAJfRNsZYR',
  },
  martorelli: {
    baseUrl: 'https://api.escola.martorelli.com.br/api',
    appKey: 'xeox6Gwx3wwCpZWCI4Z7gTG1ZQe5IV',
  },
  microkids: {
    baseUrl: 'https://beta.digital.microkids.com.br/api',
    appKey: 'InExIoXOGrYF6THjZ3rvpYmjxDtV2k7_UrVqE6vaNK8',
  },
  movimenta: {
    baseUrl: 'https://v1.comunidade.movimentaeducacao.com.br/api',
    appKey: 'O1aRI6dE626VfHFvc0hoZ0TSCWtnXdFz7pp9qfZAnOqE',
  },
  munera: {
    baseUrl: 'https://api.editoramunera.com.br/api',
    appKey: 'AA52sG8T0QMj56DIGQXnhzbvLxmVThQqobiAJfRNsZYR',
  },
  redudigital: {
    baseUrl: 'https://api.redu.digital/api',
    appKey: 'bmerE6W7teWF09nHOhEBh7ozabiR2c0X4embxXiBASU',
  },
  saberes: {
    baseUrl: 'https://beta.saberes.edicoesipdh.com.br/api',
    appKey: 'MbvjqAQ8K6Cl8uWTIbkzY3yuIPjywSmekhHXz3Vpqr0',
  },
  siao: {
    baseUrl: 'https://api.educa.siao.com.br/api',
    appKey: '2D1yiKLW6kRVRrzcU69icpNUuekF1ETX2gGh4sf4TfPW',
  },
  somos: {
    baseUrl: 'https://api.somos.redu.digital/api',
    appKey: 'OivE05OmybZU4j5mw5O77I24QhDus17Ov97kq23XKUiQ',
  },
} as const;
