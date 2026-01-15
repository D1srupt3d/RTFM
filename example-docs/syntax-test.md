# Syntax Highlighting Test

This document tests syntax highlighting across multiple languages.

## JavaScript

```javascript
const express = require('express');
const app = express();

app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Python

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Calculate first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

## Bash

```bash
#!/bin/bash

# Update system and install Docker
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

echo "Docker installed successfully!"
```

## YAML (Docker Compose)

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
    networks:
      - webnet

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    networks:
      - webnet

networks:
  webnet:
    driver: bridge
```

## JSON

```json
{
  "name": "rtfm",
  "version": "0.2.0",
  "description": "Documentation server",
  "dependencies": {
    "express": "^5.2.1",
    "marked": "^17.0.1"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## SQL

```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email) VALUES
  ('john_doe', 'john@example.com'),
  ('jane_smith', 'jane@example.com');

-- Query with join
SELECT u.username, p.title, p.created_at
FROM users u
JOIN posts p ON p.user_id = u.id
WHERE u.username = 'john_doe'
ORDER BY p.created_at DESC;
```

## Go

```go
package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
}

func main() {
    http.HandleFunc("/", handler)
    fmt.Println("Server starting on :8080")
    http.ListenAndServe(":8080", nil)
}
```

## Rust

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    
    scores.insert(String::from("Blue"), 10);
    scores.insert(String::from("Red"), 50);
    
    for (key, value) in &scores {
        println!("{}: {}", key, value);
    }
}
```

## TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  const users: User[] = await response.json();
  return users;
}

fetchUsers().then(users => {
  console.log(`Found ${users.length} users`);
});
```

## Dockerfile

```docker
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /var/www/static/;
        expires 1y;
    }
}
```

## CSS

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --font-stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #0056b3;
}
```

## Ruby

```ruby
class User
  attr_accessor :name, :email

  def initialize(name, email)
    @name = name
    @email = email
  end

  def greet
    puts "Hello, my name is #{@name}"
  end
end

user = User.new("John Doe", "john@example.com")
user.greet
```

## PHP

```php
<?php
class Database {
    private $connection;

    public function __construct($host, $user, $pass, $db) {
        $this->connection = new mysqli($host, $user, $pass, $db);
        
        if ($this->connection->connect_error) {
            die("Connection failed: " . $this->connection->connect_error);
        }
    }

    public function query($sql) {
        return $this->connection->query($sql);
    }
}

$db = new Database('localhost', 'root', 'password', 'mydb');
$result = $db->query("SELECT * FROM users");
?>
```

## Markdown

```markdown
# Heading 1

## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2
  - Nested item

1. Numbered item
2. Another item

[Link text](https://example.com)

![Alt text](image.png)
```

## HCL (Terraform)

```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "web-server"
    Environment = "production"
    ManagedBy   = "terraform"
  }

  lifecycle {
    create_before_destroy = true
  }
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.web_server.id
}
```

---

All code blocks above should be properly highlighted with:
- Correct syntax coloring
- Language badge in the top-left
- Copy button in the top-right
- Theme-appropriate colors
