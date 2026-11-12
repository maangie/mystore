# Devise で作った spree_admin_users には Spree 6 のアカウントロック用の列が無いので足す
class AddLockoutColumnsToSpreeAdminUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :spree_admin_users, :failed_attempts, :integer unless column_exists?(:spree_admin_users, :failed_attempts)
    add_column :spree_admin_users, :locked_at, :datetime unless column_exists?(:spree_admin_users, :locked_at)
  end
end
