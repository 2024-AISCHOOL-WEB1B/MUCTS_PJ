IMP.init("imp68104701"); 

const button = document.querySelector("button");

const onClickpay =async () =>{
    IMP.request_pay({

        pg: "kakaopay", // 카카오페이 결제창 호출
        pay_method: "card"
        amount: 1000,
        name: "테스트 주문",
        buyer_name: "구매자",
        buyer_email: "buyer@iamport.kr",

    })

};

button.addEventListener("click",onClickpay);