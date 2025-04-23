"""
Used for generating secret tokens
import secrets
print(secrets.token_hex(32))"""

"""
Used for hashing the passwords which are stored directly in DB
import bcrypt
plain_password = "@myPass1"
hashed = bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt())
print(hashed.decode())
"""