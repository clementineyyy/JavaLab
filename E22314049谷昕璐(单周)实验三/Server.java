import java.io.*;
import java.net.*;
import java.util.*;

public class Server {
    private static final int PORT = 8888;
    private ServerSocket serverSocket;
    private Map<String, ClientHandler> onlineUsers = new HashMap<>();

    public Server() {
        try {
            serverSocket = new ServerSocket(PORT);
            System.out.println("服务器启动，监听端口: " + PORT);
            startServer();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void startServer() {
        try {
            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("新客户端连接: " + clientSocket);

                ClientHandler clientHandler = new ClientHandler(clientSocket, this);
                new Thread(clientHandler).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // 添加在线用户
    public synchronized void addOnlineUser(String username, ClientHandler handler) {
        onlineUsers.put(username, handler);
        updateOnlineUsers();
    }

    // 移除在线用户
    public synchronized void removeOnlineUser(String username) {
        onlineUsers.remove(username);
        updateOnlineUsers();
    }

    // 更新在线用户列表
    private void updateOnlineUsers() {
        String onlineList = "ONLINE:" + String.join(",", onlineUsers.keySet());
        broadcastMessage(onlineList);
    }

    // 广播消息
    public void broadcastMessage(String message) {
        for (ClientHandler handler : onlineUsers.values()) {
            handler.sendMessage(message);
        }
    }

    // 发送私人消息
    public void sendPrivateMessage(String sender, String recipient, String message) {
        ClientHandler handler = onlineUsers.get(recipient);
        if (handler != null) {
            handler.sendMessage("MSG:" + sender + ":" + message);
        }
    }

    public static void main(String[] args) {
        new Server();
    }
}