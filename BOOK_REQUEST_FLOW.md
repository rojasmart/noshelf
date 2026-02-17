# Sistema de Gestão de Requests de Livros

## Fluxo Implementado

### 1. Estado Inicial

- O livro "Lost World" pertence ao usuário `rogeriosvaldo`
- Localização: Almada
- Status inicial: `AVAILABLE`

### 2. Request de Livro

- A usuária `carmina` faz um request para o livro
- O livro **mantém** o status `AVAILABLE` (não bloqueia imediatamente)
- O request fica com status `PENDING`

### 3. Aceitação do Request (Owner)

- O `rogeriosvaldo` (owner) aceita o request
- Status do request muda para `ACCEPTED`
- Status da cópia muda para `RESERVED`

### 4. Confirmação de Entrega (Receiver)

- Após o encontro físico, a `carmina` (receiver) confirma a receção
- Status do request muda para `COMPLETED`
- Status da cópia muda para `BORROWED`

## Status Possíveis

### Copy Status

- `AVAILABLE` - Disponível para requisição
- `REQUESTED` - _(não usado neste fluxo)_
- `RESERVED` - Reservado após aceitação do owner
- `BORROWED` - Emprestado após confirmação do receiver

### Request Status

- `PENDING` - Aguardando decisão do owner
- `ACCEPTED` - Aceito pelo owner, aguardando encontro
- `RESERVED` - _(mesmo que ACCEPTED)_
- `DELIVERED` - _(não usado neste fluxo)_
- `COMPLETED` - Livro entregue e confirmado pelo receiver

## Interface do Utilizador

### Para Requests Outgoing (Carmina)

- **PENDING**: Botões "Chat" e "Cancel"
- **ACCEPTED**: Botões "Chat" e "Confirm Delivery"
- **COMPLETED**: Apenas "Chat"

### Para Requests Incoming (Rogerio)

- **PENDING**: Botões "Chat" e "Accept"
- **ACCEPTED**: Apenas "Chat"
- **COMPLETED**: Apenas "Chat"

## Endpoints Implementados

### Novos Endpoints

```
PUT /requests/{request_id}/accept
PUT /requests/{request_id}/confirm-delivery
DELETE /requests/{request_id}
```

### Endpoints Existentes

```
GET /users/{user_id}/incoming-requests
GET /users/{user_id}/outgoing-requests
POST /requests
GET /requests/{request_id}/messages
POST /requests/{request_id}/messages
```

## Teste do Fluxo

Execute o script de teste:

```bash
cd /media/rogerio/PROMETHEUS/Personal/noshelf
python test_request_flow.py
```

Este script simula todo o fluxo descrito automaticamente.
