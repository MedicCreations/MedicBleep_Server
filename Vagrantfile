# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty32"

  config.vm.network :forwarded_port, guest: 80, host: 8080
  config.vm.synced_folder "./", "/vagrant_data", :owner=> 'vagrant', :group=>'www-data', :mount_options => ['dmode=775','fmode=775']

  config.vm.provision :shell, :inline => <<-EOS
  
    sudo apt-get update
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y php5 php5-curl phpunit curl git-core php5-xdebug postfix mysql-server php5-mysql php5-gd php5-mcrypt php5-imagick

    sudo pear upgrade pear
	sudo pear channel-discover pear.phpunit.de
	sudo pear channel-discover components.ez.no
	sudo pear channel-discover pear.symfony.com
	sudo pear install --alldeps phpunit/PHPUnit

    sudo a2enmod rewrite
    sudo sed -i '/AllowOverride None/c AllowOverride All' /etc/apache2/apache2.conf
    sudo echo 'EnableSendfile off' >> /etc/apache2/apache2.conf  

    sudo rm -rf /var/www/html
    sudo ln -s /vagrant_data /var/www/html

    sudo /etc/init.d/apache2 restart
    sudo mkdir -p /vagrant_data/Admin/logs
    sudo chmod 777 /vagrant_data/Admin/logs
    sudo mkdir -p /vagrant_data/Admin/tmp
    sudo chmod 777 /vagrant_data/Admin/tmp
    sudo mkdir -p /vagrant_data/Server/logs
    sudo chmod 777 /vagrant_data/Server/logs
    sudo mkdir -p /vagrant_data/Server/uploads
    sudo chmod 777 /vagrant_data/Server/uploads
    
    
    
  EOS
end
