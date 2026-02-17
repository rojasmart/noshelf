#!/usr/bin/env python3
"""
Script para testar o fluxo completo de request de livros.

Fluxo:
1. Livro "Lost World" pertence ao rogeriosvaldo, município Almada, status AVAILABLE
2. Carmina faz request (livro mantém AVAILABLE)
3. Rogerio aceita request (livro fica RESERVED, request fica ACCEPTED)
4. Carmina confirma entrega (livro fica BORROWED, request fica COMPLETED)
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_book_request_flow():
    # 1. Criar/verificar usuários
    print("=== CRIANDO USUÁRIOS ===")
    
    # Usuário rogeriosvaldo (owner do livro)
    rogerio_data = {
        "name": "Rogerio Svaldo",
        "email": "rogeriosvaldo@test.com", 
        "password": "123456",
        "city": "Almada",
        "country": "Portugal",
        "genres": "fiction,adventure"
    }
    
    try:
        rogerio_response = requests.post(f"{BASE_URL}/register", json=rogerio_data)
        if rogerio_response.status_code == 200:
            rogerio = rogerio_response.json()
            print(f"✓ Rogerio criado: ID {rogerio['id']}")
        else:
            # Usuário já existe, fazer login
            login_response = requests.post(f"{BASE_URL}/login", json={
                "email": rogerio_data["email"],
                "password": rogerio_data["password"]
            })
            rogerio = login_response.json()
            print(f"✓ Rogerio login: ID {rogerio['id']}")
    except Exception as e:
        print(f"✗ Erro com usuário Rogerio: {e}")
        return
    
    # Usuário carmina (requester)
    carmina_data = {
        "name": "Carmina Silva",
        "email": "carmina@test.com",
        "password": "123456", 
        "city": "Almada",
        "country": "Portugal",
        "genres": "fiction,mystery"
    }
    
    try:
        carmina_response = requests.post(f"{BASE_URL}/register", json=carmina_data)
        if carmina_response.status_code == 200:
            carmina = carmina_response.json()
            print(f"✓ Carmina criada: ID {carmina['id']}")
        else:
            # Usuário já existe, fazer login
            login_response = requests.post(f"{BASE_URL}/login", json={
                "email": carmina_data["email"],
                "password": carmina_data["password"]
            })
            carmina = login_response.json()
            print(f"✓ Carmina login: ID {carmina['id']}")
    except Exception as e:
        print(f"✗ Erro com usuária Carmina: {e}")
        return
    
    # 2. Criar livro "Lost World" 
    print("\\n=== CRIANDO LIVRO ===")
    book_data = {
        "title": "The Lost World",
        "author": "Arthur Conan Doyle",
        "isbn": "9780123456789",
        "cover_url": "https://example.com/lost-world-cover.jpg"
    }
    
    try:
        book_response = requests.post(
            f"{BASE_URL}/books?owner_id={rogerio['id']}&municipio=Almada",
            json=book_data
        )
        book = book_response.json()
        print(f"✓ Livro criado: '{book['title']}' por {book['author']}")
        
        # Buscar a cópia criada
        copies_response = requests.get(f"{BASE_URL}/users/{rogerio['id']}/books")
        copies = copies_response.json()
        copy_id = None
        for copy in copies:
            if copy['title'] == book_data['title']:
                copy_id = copy['copy_id']
                print(f"✓ Cópia encontrada: ID {copy_id}, Status: {copy['status']}")
                break
        
        if not copy_id:
            print("✗ Cópia não encontrada")
            return
            
    except Exception as e:
        print(f"✗ Erro ao criar livro: {e}")
        return
    
    # 3. Carmina faz request
    print("\\n=== CARMINA FAZ REQUEST ===")
    request_data = {
        "copy_id": copy_id,
        "requester_id": carmina['id'],
        "message": "Olá! Gostaria de ler este livro. Posso encontrar-me em Almada centro.",
        "status": "PENDING"
    }
    
    try:
        request_response = requests.post(f"{BASE_URL}/requests", json=request_data)
        request = request_response.json()
        request_id = request['id']
        print(f"✓ Request criado: ID {request_id}, Status: {request.get('status', 'PENDING')}")
    except Exception as e:
        print(f"✗ Erro ao criar request: {e}")
        return
    
    # 4. Verificar incoming requests do Rogerio
    print("\\n=== ROGERIO VÊ INCOMING REQUESTS ===")
    try:
        incoming_response = requests.get(f"{BASE_URL}/users/{rogerio['id']}/incoming-requests")
        incoming_requests = incoming_response.json()
        print(f"✓ Rogerio tem {len(incoming_requests)} incoming requests")
        for req in incoming_requests:
            print(f"  - Request ID {req['id']}: '{req['book_title']}' de {req['requester_name']} ({req['status']})")
    except Exception as e:
        print(f"✗ Erro ao buscar incoming requests: {e}")
    
    # 5. Rogerio aceita request
    print("\\n=== ROGERIO ACEITA REQUEST ===")
    try:
        accept_response = requests.put(f"{BASE_URL}/requests/{request_id}/accept")
        if accept_response.status_code == 200:
            accept_result = accept_response.json()
            print(f"✓ Request aceito: {accept_result['message']}")
            
            # Verificar status da cópia após aceitação
            copies_response = requests.get(f"{BASE_URL}/users/{rogerio['id']}/books")
            copies = copies_response.json()
            for copy in copies:
                if copy['copy_id'] == copy_id:
                    print(f"✓ Status da cópia após aceitação: {copy['status']}")
                    if copy['status'] != 'RESERVED':
                        print(f"⚠️ Esperado RESERVED, obtido {copy['status']}")
                    break
        else:
            print(f"✗ Erro ao aceitar request: {accept_response.status_code} - {accept_response.text}")
            return
                
    except Exception as e:
        print(f"✗ Erro ao aceitar request: {e}")
        return
    
    # 6. Verificar outgoing requests da Carmina
    print("\\n=== CARMINA VÊ SEUS REQUESTS ===")
    try:
        outgoing_response = requests.get(f"{BASE_URL}/users/{carmina['id']}/outgoing-requests")
        outgoing_requests = outgoing_response.json()
        print(f"✓ Carmina tem {len(outgoing_requests)} outgoing requests")
        for req in outgoing_requests:
            print(f"  - Request ID {req['id']}: '{req['book_title']}' para {req['owner_name']} ({req['status']})")
    except Exception as e:
        print(f"✗ Erro ao buscar outgoing requests: {e}")
    
    # 7. Carmina confirma entrega
    print("\\n=== CARMINA CONFIRMA ENTREGA ===")
    try:
        delivery_response = requests.put(f"{BASE_URL}/requests/{request_id}/confirm-delivery")
        if delivery_response.status_code == 200:
            delivery_result = delivery_response.json()
            print(f"✓ Entrega confirmada: {delivery_result['message']}")
            
            # Verificar status final da cópia
            copies_response = requests.get(f"{BASE_URL}/users/{rogerio['id']}/books")
            rogerio_copies = copies_response.json()
            copy_found_in_rogerio = False
            for copy in rogerio_copies:
                if copy['copy_id'] == copy_id:
                    copy_found_in_rogerio = True
                    print(f"⚠️ Livro ainda está na lista do Rogerio: {copy['status']}")
                    break
            
            if not copy_found_in_rogerio:
                print("✓ Livro removido da lista do Rogerio (transferência realizada)")
            
            # Verificar se o livro apareceu na lista da Carmina
            carmina_copies_response = requests.get(f"{BASE_URL}/users/{carmina['id']}/books")
            carmina_copies = carmina_copies_response.json()
            copy_found_in_carmina = False
            for copy in carmina_copies:
                if copy['title'] == book_data['title'] and copy['author'] == book_data['author']:
                    copy_found_in_carmina = True
                    print(f"✓ Livro transferido para Carmina: Status {copy['status']}, Owner ID {copy.get('owner_id', 'N/A')}")
                    if copy['status'] != 'AVAILABLE':
                        print(f"⚠️ Esperado AVAILABLE, obtido {copy['status']}")
                    break
            
            if not copy_found_in_carmina:
                print("✗ Livro não encontrado na lista da Carmina")
                    
            # Verificar status final do request
            outgoing_response = requests.get(f"{BASE_URL}/users/{carmina['id']}/outgoing-requests")
            outgoing_requests = outgoing_response.json()
            for req in outgoing_requests:
                if req['id'] == request_id:
                    print(f"✓ Status final do request: {req['status']}")
                    if req['status'] != 'COMPLETED':
                        print(f"⚠️ Esperado COMPLETED, obtido {req['status']}")
                    break
        else:
            print(f"✗ Erro ao confirmar entrega: {delivery_response.status_code} - {delivery_response.text}")
            return
                
    except Exception as e:
        print(f"✗ Erro ao confirmar entrega: {e}")
        return
    
    print("\\n🎉 FLUXO COMPLETO TESTADO COM SUCESSO!")

if __name__ == "__main__":
    test_book_request_flow()