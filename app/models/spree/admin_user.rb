class Spree::AdminUser < Spree.base_class
    # Spree modules
    include Spree::AdminUserMethods
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  # 管理者は自分で登録させない（:registerable を外している）
  devise :database_authenticatable,
         :recoverable, :rememberable, :validatable
end
