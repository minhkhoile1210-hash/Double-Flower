require 'webrick'

root = File.expand_path(File.dirname(__FILE__))
server = WEBrick::HTTPServer.new(
  Port: 3000,
  DocumentRoot: root,
  AccessLog: [],
  Logger: WEBrick::Log.new(File::NULL)
)

trap('INT') { server.shutdown }
puts "Douple Flower Server running on http://localhost:3000"
server.start
