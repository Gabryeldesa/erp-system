import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // USUÁRIOS
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@erp.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  await prisma.user.upsert({
    where: { email: 'financeiro@erp.com' },
    update: {},
    create: {
      name: 'João Financeiro',
      email: 'financeiro@erp.com',
      password: await bcrypt.hash('fin123', 10),
      role: Role.FINANCEIRO,
    },
  })

  await prisma.user.upsert({
    where: { email: 'rh@erp.com' },
    update: {},
    create: {
      name: 'Maria RH',
      email: 'rh@erp.com',
      password: await bcrypt.hash('rh123', 10),
      role: Role.RH,
    },
  })

  console.log('✅ Usuários criados')

  // FORNECEDORES
  const supplier1 = await prisma.supplier.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      name: 'Tech Supplies Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@techsupplies.com',
      phone: '(11) 99999-0001',
      address: 'Rua das Tecnologias, 100 - São Paulo/SP',
    },
  })

  const supplier2 = await prisma.supplier.upsert({
    where: { cnpj: '98.765.432/0001-10' },
    update: {},
    create: {
      name: 'Office Pro Distribuidora',
      cnpj: '98.765.432/0001-10',
      email: 'vendas@officepro.com',
      phone: '(11) 99999-0002',
      address: 'Av. Comercial, 500 - São Paulo/SP',
    },
  })

  console.log('✅ Fornecedores criados')

  // FUNCIONÁRIOS
  const emp1 = await prisma.employee.upsert({
    where: { cpf: '123.456.789-00' },
    update: {},
    create: {
      name: 'Carlos Silva',
      email: 'carlos.silva@empresa.com',
      cpf: '123.456.789-00',
      phone: '(11) 98888-0001',
      position: 'Analista Financeiro',
      department: 'Financeiro',
      salary: 5500.00,
      hireDate: new Date('2021-03-15'),
    },
  })

  const emp2 = await prisma.employee.upsert({
    where: { cpf: '987.654.321-00' },
    update: {},
    create: {
      name: 'Ana Costa',
      email: 'ana.costa@empresa.com',
      cpf: '987.654.321-00',
      phone: '(11) 98888-0002',
      position: 'Desenvolvedora Senior',
      department: 'TI',
      salary: 8500.00,
      hireDate: new Date('2020-06-01'),
    },
  })

  await prisma.employee.upsert({
    where: { cpf: '456.789.123-00' },
    update: {},
    create: {
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@empresa.com',
      cpf: '456.789.123-00',
      phone: '(11) 98888-0003',
      position: 'Gerente de RH',
      department: 'RH',
      salary: 7200.00,
      hireDate: new Date('2019-01-10'),
    },
  })

  console.log('✅ Funcionários criados')

  // CONTAS A PAGAR
  await prisma.accountsPayable.createMany({
    data: [
      {
        description: 'Aluguel escritório',
        amount: 4500.00,
        dueDate: new Date('2026-05-10'),
        status: 'PENDING',
        category: 'Infraestrutura',
      },
      {
        description: 'Conta de energia',
        amount: 850.00,
        dueDate: new Date('2026-04-20'),
        status: 'PENDING',
        category: 'Utilidades',
      },
      {
        description: 'Licença de software',
        amount: 1200.00,
        dueDate: new Date('2026-04-15'),
        status: 'PAID',
        paidAt: new Date('2026-04-10'),
        category: 'TI',
        supplierId: supplier1.id,
      },
      {
        description: 'Material de escritório',
        amount: 350.00,
        dueDate: new Date('2026-04-25'),
        status: 'PENDING',
        category: 'Administrativo',
        supplierId: supplier2.id,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Contas a pagar criadas')

  // CONTAS A RECEBER
  await prisma.accountsReceivable.createMany({
    data: [
      {
        description: 'Serviço de consultoria - Cliente A',
        amount: 12000.00,
        dueDate: new Date('2026-04-30'),
        status: 'PENDING',
        category: 'Serviços',
      },
      {
        description: 'Venda de produtos - Cliente B',
        amount: 8500.00,
        dueDate: new Date('2026-04-20'),
        status: 'RECEIVED',
        receivedAt: new Date('2026-04-18'),
        category: 'Vendas',
      },
      {
        description: 'Mensalidade sistema - Cliente C',
        amount: 2500.00,
        dueDate: new Date('2026-05-05'),
        status: 'PENDING',
        category: 'Serviços',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Contas a receber criadas')

  // TRANSAÇÕES FINANCEIRAS
  await prisma.financialTransaction.createMany({
    data: [
      { description: 'Receita de vendas', amount: 15000, type: 'INCOME', category: 'Vendas', date: new Date('2026-04-01') },
      { description: 'Pagamento fornecedor', amount: 3200, type: 'EXPENSE', category: 'Compras', date: new Date('2026-04-02') },
      { description: 'Receita consultoria', amount: 8000, type: 'INCOME', category: 'Serviços', date: new Date('2026-04-05') },
      { description: 'Salários', amount: 25000, type: 'EXPENSE', category: 'RH', date: new Date('2026-04-05') },
      { description: 'Receita licença', amount: 4500, type: 'INCOME', category: 'Serviços', date: new Date('2026-04-08') },
      { description: 'Aluguel', amount: 4500, type: 'EXPENSE', category: 'Infraestrutura', date: new Date('2026-04-10') },
      { description: 'Receita vendas', amount: 22000, type: 'INCOME', category: 'Vendas', date: new Date('2026-04-12') },
      { description: 'Marketing', amount: 2800, type: 'EXPENSE', category: 'Marketing', date: new Date('2026-04-12') },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Transações financeiras criadas')

  // PRODUTOS
  const prod1 = await prisma.product.upsert({
    where: { sku: 'PROD-001' },
    update: {},
    create: {
      name: 'Notebook Dell Inspiron',
      description: 'Notebook para uso corporativo',
      sku: 'PROD-001',
      price: 3500.00,
      unit: 'UN',
    },
  })

  const prod2 = await prisma.product.upsert({
    where: { sku: 'PROD-002' },
    update: {},
    create: {
      name: 'Mouse sem fio',
      description: 'Mouse wireless ergonômico',
      sku: 'PROD-002',
      price: 120.00,
      unit: 'UN',
    },
  })

  await prisma.product.upsert({
    where: { sku: 'PROD-003' },
    update: {},
    create: {
      name: 'Cadeira ergonômica',
      description: 'Cadeira para escritório',
      sku: 'PROD-003',
      price: 850.00,
      unit: 'UN',
    },
  })

  console.log('✅ Produtos criados')

  // ESTOQUE
  await prisma.inventory.createMany({
    data: [
      { productId: prod1.id, quantity: 15, type: 'IN' },
      { productId: prod2.id, quantity: 50, type: 'IN' },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Estoque criado')

  // CONTRATOS
  await prisma.contract.createMany({
    data: [
      {
        title: 'Contrato de Manutenção TI',
        description: 'Manutenção preventiva e corretiva de equipamentos',
        value: 24000.00,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        status: 'ACTIVE',
        supplierId: supplier1.id,
      },
      {
        title: 'Fornecimento de Material',
        description: 'Fornecimento mensal de material de escritório',
        value: 6000.00,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
        supplierId: supplier2.id,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Contratos criados')

  // NOTAS FISCAIS
  await prisma.invoice.createMany({
    data: [
      {
        number: 'NF-2026-001',
        type: 'ENTRADA',
        issueDate: new Date('2026-04-05'),
        value: 3500.00,
        tax: 245.00,
        status: 'ACTIVE',
        supplierId: supplier1.id,
      },
      {
        number: 'NF-2026-002',
        type: 'SAIDA',
        issueDate: new Date('2026-04-08'),
        value: 12000.00,
        tax: 840.00,
        status: 'ACTIVE',
      },
      {
        number: 'NF-2026-003',
        type: 'ENTRADA',
        issueDate: new Date('2026-04-10'),
        value: 850.00,
        tax: 59.50,
        status: 'ACTIVE',
        supplierId: supplier2.id,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Notas fiscais criadas')

  // PROCESSOS JURÍDICOS
  await prisma.legalProcess.createMany({
    data: [
      {
        title: 'Ação Trabalhista - Ex-funcionário',
        number: 'PROC-2026-001',
        type: 'Trabalhista',
        status: 'ACTIVE',
        deadline: new Date('2026-06-15'),
        description: 'Reclamação trabalhista sobre horas extras',
        value: 15000.00,
      },
      {
        title: 'Contrato em litígio - Fornecedor X',
        number: 'PROC-2026-002',
        type: 'Cível',
        status: 'ACTIVE',
        deadline: new Date('2026-07-20'),
        description: 'Disputa sobre descumprimento contratual',
        value: 45000.00,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Processos jurídicos criados')

  // PLANO DE CONTAS
  const account1 = await prisma.accountPlan.upsert({
    where: { code: '1.1.001' },
    update: {},
    create: { code: '1.1.001', name: 'Caixa', type: 'ATIVO' },
  })

  const account2 = await prisma.accountPlan.upsert({
    where: { code: '1.1.002' },
    update: {},
    create: { code: '1.1.002', name: 'Banco Conta Corrente', type: 'ATIVO' },
  })

  const account3 = await prisma.accountPlan.upsert({
    where: { code: '3.1.001' },
    update: {},
    create: { code: '3.1.001', name: 'Receita de Vendas', type: 'RECEITA' },
  })

  console.log('✅ Plano de contas criado')

  // LANÇAMENTOS CONTÁBEIS
  await prisma.accountingEntry.createMany({
    data: [
      {
        accountPlanId: account2.id,
        description: 'Recebimento de vendas',
        debit: 15000,
        credit: 0,
        date: new Date('2026-04-01'),
      },
      {
        accountPlanId: account3.id,
        description: 'Receita de vendas reconhecida',
        debit: 0,
        credit: 15000,
        date: new Date('2026-04-01'),
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Lançamentos contábeis criados')

  console.log('🎉 Seed concluído com sucesso!')
  console.log('📧 Login: admin@erp.com | Senha: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })