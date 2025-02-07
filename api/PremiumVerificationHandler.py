from flask_restful import Resource
from flask_jwt_extended import jwt_required

class PremiumVerificationHandler(Resource):
  @jwt_required()
  def get(self):
    print("[CUSTOM] STARTING and ENDING PremiumVerificationHandler.py (This request is only needed to verify jwt token)")
    
    # user = get_jwt_identity()
    # print(f"Hello, {user}! This is a protected route.")
