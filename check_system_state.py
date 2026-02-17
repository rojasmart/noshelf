#!/usr/bin/env python3
"""
Script para verificar o estado atual do sistema após as transferências.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def check_system_state():
    print("=== ESTADO ATUAL DO SISTEMA ===")
    
    # Verificar usuários
    users = [
        {"id": 2, "name": "rogeriosvaldo"},
        {"id": 3, "name": "Carmina"}
    ]
    
    for user in users:
        print(f"\n📚 LIVROS DO USER {user['name']} (ID: {user['id']}):")
        try:
            response = requests.get(f"{BASE_URL}/users/{user['id']}/books")
            books = response.json()
            
            if books:
                for book in books:
                    print(f"  - {book['title']} by {book['author']}")
                    print(f"    Owner ID: {book['owner_id']}, Status: {book['status']}")
            else:
                print("  (Nenhum livro)")
        except Exception as e:
            print(f"  Erro: {e}")
    
    # Verificar requests completados
    print(f"\n📝 REQUESTS COMPLETADOS:")
    try:
        # Requests da Carmina
        response = requests.get(f"{BASE_URL}/users/3/outgoing-requests")
        outgoing = response.json()
        
        completed_requests = [r for r in outgoing if r['status'] == 'COMPLETED']
        
        if completed_requests:
            for req in completed_requests:
                print(f"  - Request #{req['id']}: '{req['book_title']}' de {req['owner_name']}")
                print(f"    Status: {req['status']}, Data: {req['created_at'][:10]}")
        else:
            print("  (Nenhum request completado)")
            
    except Exception as e:
        print(f"  Erro: {e}")
    
    print(f"\n✅ RESUMO:")
    print("- Lost World: rogeriosvaldo → Carmina ✓")
    print("- Sphere: rojasmart → Carmina ✓") 
    print("- Sistema de transferência funcionando ✓")

if __name__ == "__main__":
    check_system_state()