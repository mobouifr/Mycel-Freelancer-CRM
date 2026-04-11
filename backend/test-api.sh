TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test2@example.com", "password":"password123", "name": "Test"}' | jq -r .access_token)
if [ "$TOKEN" == "null" ]; then
  TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test2@example.com", "password":"password123"}' | jq -r .access_token)
fi

echo "Created/Logged in: $TOKEN"

CLIENT_ID=$(curl -s -X POST http://localhost:3000/api/clients -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name": "Client A"}' | jq -r .id)
echo "Created Client: $CLIENT_ID"

PROJECT_ID=$(curl -s -X POST http://localhost:3000/api/projects -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"title": "Project A", "clientId": "'$CLIENT_ID'"}' | jq -r .id)
echo "Created Project: $PROJECT_ID"

echo "Fetching projects for client..."
curl -s -X GET http://localhost:3000/api/clients/$CLIENT_ID/projects -H "Authorization: Bearer $TOKEN" | jq
