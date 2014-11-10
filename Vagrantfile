# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "centos65"

  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.synced_folder "./", "/vagrant_data", :owner=> 'vagrant', :group=>'vagrant', :mount_options => ['dmode=775','fmode=775']

  config.vm.provision :shell, :inline => <<-EOS

    echo "Initializing Yum repositories..."
    yum update -y > /dev/null
    yum -y install epel-release > /dev/null
    rpm -Uvh http://rpms.famillecollet.com/enterprise/remi-release-6.rpm > /dev/null

    echo "Installing Apache/MySQL/PHP..."
    yum -y --enablerepo=remi,remi-php55 install httpd mysql mysql-server php php-common php-pdo php-pear php-cli php-devel php-mysql php-mbstring php-gd unzip > /dev/null

    echo "Installing PHPExtensions..."
    pecl install xdebug > /dev/null

    echo "Disabling iptables..."
    chkconfig iptables off
    /etc/init.d/iptables stop > /dev/null

    echo "Initializing Server config..."
    chkconfig httpd on
    sed -i "s/vagrant:x:500:/vagrant:x:500:apache/" /etc/group

    pear upgrade pear
        pear channel-update pear.php.net
        pear channel-discover pear.phpunit.de
        pear channel-discover components.ez.no
        pear channel-discover pear.symfony.com
        pear install --alldeps phpunit/PHPUnit

    sed -i '/AllowOverride None/c AllowOverride All' /etc/httpd/conf/httpd.conf
    echo 'EnableSendfile off' >> /etc/httpd/conf/httpd.conf

    rm -rf /var/www/html
    ln -s /vagrant_data /var/www/html

    service httpd restart
    mkdir -p /vagrant_data/Admin/logs
    chmod 777 /vagrant_data/Admin/logs
    mkdir -p /vagrant_data/Admin/tmp
    chmod 777 /vagrant_data/Admin/tmp
    mkdir -p /vagrant_data/Server/logs
    chmod 777 /vagrant_data/Server/logs
    mkdir -p /vagrant_data/Server/uploads
    chmod 777 /vagrant_data/Server/uploads

    echo "Updating composer..."
    cd /vagrant_data/Admin
    php composer.phar self-update > /dev/null
    php composer.phar update > /dev/null
    cd /vagrant_data/Server
    php composer.phar self-update > /dev/null
    php composer.phar update > /dev/null

    echo "Initializing MySQL..."
    chkconfig mysqld on
    service mysqld start
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS spikadb;"
    mysql -u root spikadb -f < /vagrant_data/Server/spika_enterprise_db.sql > /dev/null

  EOS
end
