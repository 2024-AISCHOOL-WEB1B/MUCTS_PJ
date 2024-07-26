        document.getElementById('searchAddrButton').addEventListener('click', sample4_execDaumPostcode);

        function sample4_execDaumPostcode() {
            var element_wrap = document.createElement('div'); // 팝업을 감쌀 div 생성
            document.body.appendChild(element_wrap); // body에 div 추가

            var currentPostcode = new daum.Postcode({
                oncomplete: function (data) {
                    // 지번 주소를 표시하는 코드
                    var jibunAddr = data.jibunAddress; // 지번 주소 변수
                    var extraJibunAddr = ''; // 참고 항목 변수

                    // 법정동명이 있을 경우 추가한다.
                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                        extraJibunAddr += data.bname;
                    }
                    // 건물명이 있고, 공동주택일 경우 추가한다.
                    if (data.buildingName !== '' && data.apartment === 'Y') {
                        extraJibunAddr += (extraJibunAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
                    if (extraJibunAddr !== '') {
                        extraJibunAddr = ' (' + extraJibunAddr + ')';
                    }

                    // 우편번호와 지번 주소 정보를 해당 필드에 넣는다.
                    document.getElementById('sample4_postcode').value = data.zonecode;
                    document.getElementById("sample4_jibunAddress").value = jibunAddr + extraJibunAddr;

                    // 팝업을 감싼 div 제거
                    document.body.removeChild(element_wrap);
                },
                container: element_wrap
            });

            currentPostcode.open();
        }

        // 정보수정 모달창 js

        function openModal() {
            document.getElementById("info_modal").style.display = "block";
            console.log("이벤트발생");
        }

        function closeModal() {
            document.getElementById("info_modal").style.display = "none";
        }

        window.onclick = function (event) {
            if (event.target == document.getElementById("info_modal")) {
                closeModal();
            }
        }
        document.querySelector("#changeInfo_btn2").onclick = function () {
            closeModal();
        }

    
