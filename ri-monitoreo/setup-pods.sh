#!/bin/bash

# === setup-pods.sh ===
# Configura entorno Ruby 2.7.8 + CocoaPods 1.11.3 aislado con Bundler

echo "⚙️  Estableciendo Ruby 2.7.8..."
rbenv install -s 2.7.8
rbenv local 2.7.8

echo "💎 Instalando bundler..."
gem install bundler

echo "📄 Generando Gemfile con CocoaPods 1.11.3..."
cat > Gemfile <<EOF
source 'https://rubygems.org'

ruby '2.7.8'
gem 'cocoapods', '1.11.3'
EOF

echo "📦 Instalando dependencias en entorno aislado..."
bundle install

echo "📁 Entrando a carpeta ios/..."
cd ios || { echo "❌ No se encontró carpeta ios/"; exit 1; }

echo "🔧 Ejecutando pod install..."
bundle exec pod install --repo-update

echo "✅ CocoaPods instalado y configurado con éxito en entorno seguro (Ruby 2.7.8 + bundler)"
