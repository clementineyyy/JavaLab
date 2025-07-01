import java.io.*;
import java.net.*;

public class ClientHandler implements Runnable {
    private Socket clientSocket;
    private Server server;
    private BufferedReader in;
    private PrintWriter out;
    private String username;

    public ClientHandler(Socket socket, Server server) {
        this.clientSocket = socket;
        this.server = server;

        try {
            in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            out = new PrintWriter(clientSocket.getOutputStream(), true);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        try {
            // 第一条消息是用户名
            username = in.readLine();
            System.out.println(username + " 已连接");

            // 添加到在线用户列表
            server.addOnlineUser(username, this);

            String message;
            while ((message = in.readLine()) != null) {
                processMessage(message);
            }
        } catch (IOException e) {
            System.out.println(username + " 已断开连接");
        } finally {
            close();
        }
    }

    // 处理客户端消息
    private void processMessage(String message) {
        if (message.startsWith("PRIVATE:")) {
            // 私人消息格式: PRIVATE:recipient:message
            String[] parts = message.split(":", 3);
            if (parts.length == 3) {
                String recipient = parts[1];
                String content = parts[2];
                server.sendPrivateMessage(username, recipient, content);
            }
        }
    }

    // 发送消息给客户端
    public void sendMessage(String message) {
        out.println(message);
    }

    // 关闭连接
    private void close() {
        try {
            server.removeOnlineUser(username);
            in.close();
            out.close();
            clientSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
