const socketIo = require("socket.io");
const conn = require("./config/db");


module.exports = (server) => {
    const io = socketIo(server);
    // 가져올 party 정보를 저장할 거임
    let roomList = {};

    // 진행중인(party_status=1) Party_TB 가져오기 
    const sql = `
    select * from Party_TB where party_status = 1
    `;

    // 쿼리 실행
    conn.query(sql, (err, results) => {
        if (err) {
            console.error("소켓에서 DB 불러오기 실패", err);
            return;
        }
        else {
            for(let i = 0 ; i < results.length ; i++){
                roomList[results[i].party_id] = results[i];
                roomList[results[i].party_id].participantsID = [];
                roomList[results[i].party_id].participantsNick = [];
            }
            console.log("소켓 select 결과값 : ", results);
            console.log("소켓 select 첫번째 결과값 : ", roomList[results[0].party_id]);
            console.log("소켓 select 첫번째 결과값의 party_id : ", roomList[results[0].party_id].party_id);

        }
    });

   
    io.on('connection', (socket) => {
        let roomId; // 채팅방 고유 id (중복x)
        let roomTitle;
        let userNick; // 클라이언트의 닉네임
        let maxRoomCapacity // 채팅방 최대 수용 인원
        console.log(`클라이언트 ${socket.id} 접속`);

        // 클라이언트가 채팅방에 들어감
        socket.on('enter room', (data)=>{
            roomId = data.roomId;
            userNick = data.nick||"Geust's Nickname";
            userId = data.userId||"Guest's ID"
            roomTitle = roomList[roomId]?.party_title||"존재하지 않는 방";
            min_amount = roomList[roomId]?.min_amount||0; // 최소금액
            maxRoomCapacity = roomList[roomId]?.personnel||0;
            

            // 존재하지 않는 방에 갔을 경우
            if(!roomList[roomId]){
                console.log(`${userNick} 사용자가 존재하지 않는 방에 들어가서 연결 종료`);
                socket.emit('void room', "존재하지 않는 방입니다.. 다른 방으로 ㄱㄱ")
                socket.disconnect();
                return; // 연결 종료
            }
            
            if(roomList[roomId].participantsID.length >= maxRoomCapacity){
                socket.emit('full room', "방 인원이 가득 찼습니다.. 뒤로가기 해주세요ㅠㅠ");
                socket.disconnect();
                return; // 연결 종료
            }
            
            // 사용자 추가
            if(roomList[roomId].participantsID.indexOf(userId) === -1){
                roomList[roomId].participantsID.push(userId);
                roomList[roomId].participantsNick.push(userNick);
            }
            
            console.log('채팅방 입장할 때 : ', data, roomList);

            socket.join(roomId);
            console.log(`사용자 ${userNick} 방 ${roomTitle}에 입장`);
        
            // 클라이언트 인원 현황 리로드
            io.to(roomId).emit('reload participants', roomList[roomId])

            // 입장한 사용자에게 메시지 전송
            socket.emit('you joined room', {roomTitle : roomTitle, min_amount : min_amount, msg :`${roomTitle} 방에 입장하셨습니다. 매너 채팅 부탁😜`});

            // 같은 채팅방에 있는 기존 클라이언트에게 메시지 전송
            socket.to(roomId).emit('new user', `${userNick}님께서 입장하셨습니다!`);

        });

        // 클라이언트가 입력한 채팅 받기
        socket.on('send message', (data) => {
            console.log(socket.rooms);
            console.log(`${data.msg} from ${socket.id} room ${roomId}`);

            // 클라이언트에게 받은 메시지를 같은 방에 있는 모든 사용자에게 반환
            socket.emit('return myMessage', data);
            socket.to(roomId).emit('return message', data);
        })

        // 클라이언트에서 집결지 위치 받기
        socket.on('send gathering', (data)=>{
            let lat = data.lat;
            let lng = data.lng;
            console.log(`서버가 사용자에게 집결지를 받음, 위도 ${lat}} 경도 ${lng}`);
            socket.to(roomId).emit('show gathering', {lat : lat, lng : lng});
        })

        // 연결 종료
        socket.on('disconnect', () => {
            /*
            Optional Chaining 연산자는 객체의 깊은 프로퍼티에 접근할 때,
            그 중간에 null 또는 undefined가 있어도 오류를 발생시키지 않고 undefined를 반환합니다. 
            이는 코드의 안정성을 높이고, 중간 값이 null 또는 undefined인 경우에 대한 예외 처리를 쉽게 해줍니다.
            */
            if (roomList[roomId]) {
                const idx = roomList[roomId].participantsNick.indexOf(userNick);
                if (idx !== -1) {
                    roomList[roomId].participantsNick.splice(idx, 1); // 요소 삭제
                    roomList[roomId].participantsID.splice(idx, 1); // 요소 삭제
                }
        
                // 방이 비어있다면 
                if (roomList[roomId].participantsID.length === 0) {
                    delete roomList[roomId];
                    
                    let sql = `
                            update Party_TB 
                            set party_status = 0
                            where party_id = ?
                        `
                    // 쿼리 실행
                    conn.query(sql, roomId, (err, results) => {
                        if (err) {
                            console.error("방이 비어 있는데 Party_TB 상태 업데이트 실패", err);
                            return;
                        }
                        else {
                            console.log(`party_id ${roomId} 비활성화 완료!`, results)
                        }
                    });
                }
            }

            // 클라이언트 인원 현황 리로드
            io.to(roomId).emit('reload participants', roomList[roomId])

            console.log(`클라이언트 ${socket.id} 접속 해제`);
            console.log('접속 해제 하고', roomList[roomId], roomList[roomId]?.length);
        });
    });
    // 채팅방 코드 끝!
}