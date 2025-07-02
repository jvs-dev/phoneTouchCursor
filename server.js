const WebSocket = require('ws');
const { mouse, Button, Point } = require('@nut-tree-fork/nut-js');

// Configurações do servidor WebSocket
const wss = new WebSocket.Server({ port: 8080 }); // Porta para a conexão

console.log('Servidor WebSocket iniciado na porta 8080');
console.log('Aguardando conexão do celular...');

// Configura o nut-js para não auto-ligar o logger, a menos que você queira
// mouse.config.autoDelayMs = 10; // Opcional: Adiciona um pequeno delay entre as ações para maior estabilidade

wss.on('connection', ws => {
    console.log('Celular conectado!');

    ws.on('message', async message => { // Usar async aqui porque as operações do nut-js são assíncronas
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'move':
                    // Movimento do mouse
                    const { deltaX, deltaY } = data;
                    const currentPos = await mouse.getPosition(); // Obtém a posição atual do mouse
                    const newX = currentPos.x + deltaX;
                    const newY = currentPos.y + deltaY;
                    await mouse.setPosition(new Point(newX, newY)); // Define a nova posição
                    break;
                case 'click':
                    // Clique do mouse (botão esquerdo por padrão)
                    await mouse.click(Button.LEFT);
                    console.log('Clique esquerdo recebido!');
                    break;
                case 'rightClick':
                    // Clique do mouse (botão direito)
                    await mouse.click(Button.RIGHT);
                    console.log('Clique direito recebido!');
                    break;
                case 'press':
                    await mouse.pressButton(Button.LEFT)
                    console.log('Pressionar direito recebido!');
                    break
                case 'scroll':
                    // Rolagem do mouse
                    const { scrollDeltaY } = data;
                    // O nut-js lida com rolagem como scrollDown/scrollUp.
                    // Precisamos adaptar o deltaY para isso.
                    if (scrollDeltaY > 0) {
                        await mouse.scrollDown(scrollDeltaY / 100); // Ajuste o divisor para suavizar a rolagem
                    } else if (scrollDeltaY < 0) {
                        await mouse.scrollUp(Math.abs(scrollDeltaY) / 100); // Ajuste o divisor
                    }
                    console.log('Rolagem recebida:', scrollDeltaY);
                    break;
                default:
                    console.log('Tipo de mensagem desconhecido:', data.type);
            }
        } catch (error) {
            console.error('Erro ao processar mensagem ou ação do mouse:', error);
        }
    });

    ws.on('close', () => {
        console.log('Celular desconectado.');
    });

    ws.on('error', error => {
        console.error('Erro no WebSocket:', error);
    });
});