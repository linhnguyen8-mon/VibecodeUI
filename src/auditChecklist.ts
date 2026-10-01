export type AuditFramework = { id: string; name: string; purpose: string; when: string; criteria: string[] };
export const auditChecklist: { id: string; title: string; desc: string; frameworks: AuditFramework[] }[] = [
  {
    id:'A', title:'Strategic & Business',
    desc:'Kiểm tra flow/screen có cân bằng giữa nhu cầu người dùng, khả năng triển khai và giá trị kinh doanh.',
    frameworks:[
      {
        id:'ideo', name:'IDEO Framework (Desirability – Feasibility – Viability)',
        purpose:'Xác định 1 flow/feature có cân bằng giữa: user có cần không (Desirability), team có làm được không (Feasibility), và có lợi cho business không (Viability).',
        when:'Giai đoạn concept validation, feature prioritization — trước khi đầu tư dev resource.',
        criteria:[
          'Desirability: Có bằng chứng (user research, feedback, data) cho thấy user thực sự cần tính năng này?',
          'Desirability: Tính năng có giải quyết đúng pain point, hay chỉ là "nice to have" mơ hồ?',
          'Feasibility: Team hiện tại có đủ tech stack/skill để build trong timeline đề ra?',
          'Feasibility: Có dependency rủi ro nào (API bên thứ 3, hạ tầng, dữ liệu) chưa được xử lý?',
          'Viability: Tính năng có gắn với 1 KPI/revenue stream cụ thể, và chi phí duy trì có hợp lý?'
        ]
      },
      {
        id:'jtbd', name:'Jobs To Be Done (JTBD)',
        purpose:'User không mua sản phẩm — họ "thuê" sản phẩm để hoàn thành 1 job cụ thể, gồm cả tiến bộ về chức năng, cảm xúc và xã hội.',
        when:'Viết problem statement, định hình phạm vi tính năng, brainstorm giải pháp mới.',
        criteria:[
          'Đã viết được job story theo cấu trúc: "Khi [tình huống], tôi muốn [hành động], để [kết quả mong muốn]"?',
          'Job story có phân biệt rõ 3 khía cạnh: functional (làm được việc), emotional (cảm thấy thế nào), social (được nhìn nhận ra sao)?',
          'Giải pháp hiện tại có thực sự giải quyết đúng "job" đó, hay chỉ xử lý phần bề mặt/triệu chứng?'
        ]
      },
      {
        id:'kano', name:'Kano Model',
        purpose:'Phân loại feature theo mức độ tác động đến sự hài lòng của user, giúp ưu tiên roadmap hợp lý.',
        when:'Feature prioritization, lập roadmap, quyết định cắt giảm scope khi thiếu resource.',
        criteria:[
          'Feature đã được xếp đúng vào 1 trong 5 nhóm: Must-be / Performance / Attractive / Indifferent / Reverse?',
          'Must-be: có thiếu sót nào ở nhóm này gây dissatisfaction ngay lập tức cho user không?',
          'Performance: mức đầu tư có tỉ lệ thuận với mức satisfaction tăng thêm (one-dimensional) không?',
          'Attractive: tính năng có tạo được "aha moment" thực sự bất ngờ, vượt kỳ vọng user?',
          'Indifferent / Reverse: có đang lãng phí resource cho feature không ai cần, hoặc gây khó chịu ngược?'
        ]
      },
      {
        id:'cubi', name:'CUBI Action Cycle',
        purpose:'Đánh giá 1 chu trình hành động của user qua 4 bước: Communication → Reaction → Action → Transaction.',
        when:'Đánh giá luồng CTA/conversion, landing page, form đăng ký hoặc thanh toán.',
        criteria:[
          'Communication: Thông điệp/CTA có truyền tải rõ ràng giá trị mang lại cho user?',
          'Reaction: User có chú ý và hiểu đúng thông điệp như kỳ vọng thiết kế không?',
          'Action: User có thể thực hiện hành động mong muốn (click, nhập liệu, chọn) một cách dễ dàng?',
          'Transaction: Hành động đó có dẫn đến kết quả/giá trị cuối cùng (hoàn tất, convert) không bị rớt giữa chừng?'
        ]
      }
    ]
  },
  {
    id:'B', title:'Behavioral & Task Flow',
    desc:'Đánh giá hành vi và tương tác của user trong sản phẩm: họ có hiểu / thực hiện / đạt được mục tiêu dễ hay khó.',
    frameworks:[
      {
        id:'cog-walkthrough', name:'Cognitive Walkthrough',
        purpose:'Đánh giá learnability cho user lần đầu sử dụng, tập trung vào từng bước cụ thể trong task flow.',
        when:'Test 1 task flow cụ thể — đặc biệt onboarding hoặc tính năng mới.',
        criteria:[
          'Ở bước này, user có biết mình cần cố gắng đạt được mục tiêu gì (sẽ "try" hành động) không?',
          'User có nhận ra CTA/hành động chính đang có mặt và khả dụng (visible) không?',
          'User có hiểu CTA đó sẽ dẫn tới đúng kết quả họ mong muốn (label rõ nghĩa) không?',
          'Sau khi thực hiện, user có nhận được feedback/progress rõ ràng để biết đã tiến thêm 1 bước?',
          'Ghi nhận: bất kỳ câu trả lời "Không" nào ở 4 mục trên = 1 usability problem cụ thể cần note lại.'
        ]
      },
      {
        id:'norman-gulfs', name:"Norman's Gulfs of Execution & Evaluation (7 Stages of Action)",
        purpose:'Phát hiện khoảng cách (gulf) giữa ý định của user và khả năng hệ thống cho phép thực hiện/diễn giải.',
        when:'Debug 1 flow gây confuse, phân tích lỗi tương tác ở mức chi tiết.',
        criteria:[
          'Goal: User có xác định rõ mục tiêu trước khi bắt đầu tương tác không?',
          'Plan: Hệ thống có gợi ý hướng đi hợp lý (affordance, signifier) để user lên kế hoạch?',
          'Specify: Chuỗi hành động A → B → C có rõ ràng, không mơ hồ về thứ tự?',
          'Execute: Thao tác vật lý (click, gõ, vuốt) có dễ thực hiện, target đủ lớn/gần (liên hệ Fitts\'s Law)?',
          'Perceive: Ngay sau hành động, hệ thống có phản hồi trạng thái tức thì (visibility of system status)?',
          'Interpret: Phản hồi đó có dễ hiểu, không gây hiểu lầm về ý nghĩa?',
          'Compare: User có dễ dàng so sánh kết quả hiện tại với mục tiêu ban đầu để biết đã hoàn tất chưa?'
        ]
      },
      {
        id:'heart-gsm', name:'HEART + Goal-Signal-Metric (GSM)',
        purpose:'5 chiều đo chất lượng UX (Happiness, Engagement, Adoption, Retention, Task Success), gắn với Goal → Signal → Metric.',
        when:'Đánh giá khi đã có data/analytics, thiết lập KPI theo dõi cho 1 feature.',
        criteria:[
          'Happiness: Có kênh đo mức độ hài lòng của user (CSAT, survey, app rating) không?',
          'Engagement: Có track được tần suất/độ sâu tương tác (session, feature usage) không?',
          'Adoption: Có đo được tỉ lệ user mới bắt đầu dùng feature/sản phẩm không?',
          'Retention: Có đo được tỉ lệ user quay lại sử dụng theo thời gian không?',
          'Task Success: Có đo được tỉ lệ hoàn thành task chính xác và trong thời gian hợp lý không?',
          'Mỗi Goal đề ra có đi kèm 1 Signal quan sát được và 1 Metric đo lường cụ thể (không chỉ là ý định mơ hồ)?'
        ]
      }
    ]
  },
  {
    id:'C', title:'Heuristic & Holistic-Quality',
    desc:'Áp dụng các bộ nguyên tắc kinh điển (heuristic) để đánh giá tổng thể chất lượng trải nghiệm.',
    frameworks:[
      {
        id:'nielsen', name:"Nielsen's 10 Usability Heuristics",
        purpose:'Bộ 10 nguyên tắc kinh điển để heuristic evaluation cho bất kỳ giao diện nào, không cần user thật.',
        when:'Audit tổng quát 1 screen/flow, review nhanh nội bộ không cần test user.',
        criteria:[
          'Visibility of system status: Hệ thống có luôn cho user biết đang ở đâu / đang xảy ra chuyện gì?',
          'Match between system and real world: Ngôn ngữ, biểu tượng có theo quy ước quen thuộc của user?',
          'User control and freedom: User có "lối thoát" (undo, cancel, back) khi làm sai không?',
          'Consistency and standards: Cách đặt tên, hành vi có nhất quán trong toàn bộ sản phẩm?',
          'Error prevention: Thiết kế có ngăn lỗi xảy ra từ đầu (validation, confirmation) thay vì để lỗi rồi mới xử lý?',
          'Recognition rather than recall: User có thể nhận diện lựa chọn thay vì phải nhớ lại thông tin?',
          'Flexibility and efficiency of use: Có hỗ trợ shortcut/tùy biến cho user có kinh nghiệm không?',
          'Aesthetic and minimalist design: Giao diện có loại bỏ thông tin không cần thiết, tránh rối mắt?',
          'Help users recognize, diagnose, and recover from errors: Thông báo lỗi có rõ ràng, gợi ý cách khắc phục?',
          'Help and documentation: Nếu cần, có tài liệu/hướng dẫn dễ tìm và dễ hiểu không?'
        ]
      },
      {
        id:'krug', name:"Krug's Don't Make Me Think",
        purpose:'Kiểm tra mức độ "scan được" của UI — user không đọc kỹ, chỉ lướt và chọn phương án đủ tốt đầu tiên.',
        when:'Landing page, navigation, form — nơi cần giảm friction đọc-hiểu.',
        criteria:[
          'Layout có phân cấp thị giác (visual hierarchy) rõ ràng giúp mắt quét nhanh nội dung quan trọng?',
          'Có tối thiểu hóa số lượng "dấu chấm hỏi" — điểm khiến user phải dừng lại suy nghĩ — trên mỗi màn hình?',
          'CTA/đường dẫn chuyển đổi chính có nổi bật, không bị lẫn với nội dung phụ?'
        ]
      },
      {
        id:'quesenbery', name:"Whitney Quesenbery's 5 Es",
        purpose:'5 chiều đo usability: Effective, Efficient, Engaging, Error tolerant, Easy to learn.',
        when:'Đánh giá toàn diện 1 sản phẩm/feature đã tương đối hoàn thiện.',
        criteria:[
          'Effective: User có hoàn thành đúng và đầy đủ mục tiêu đề ra không?',
          'Efficient: Tốc độ hoàn thành task có nhanh mà vẫn chính xác không?',
          'Engaging: Trải nghiệm có dễ chịu, khiến user hài lòng khi sử dụng không?',
          'Error tolerant: Hệ thống có ngăn ngừa lỗi và giúp phục hồi dễ dàng khi có lỗi xảy ra?',
          'Easy to learn: User lần đầu (beginner) có thể làm quen nhanh chóng, thân thiện không?'
        ]
      },
      {
        id:'honeycomb', name:'UX Honeycomb (Peter Morville)',
        purpose:'Mở rộng khái niệm usability ra 7 khía cạnh trải nghiệm toàn diện.',
        when:'Đánh giá chiến lược sản phẩm ở tầm nhìn tổng thể, không chỉ dừng ở giao diện.',
        criteria:[
          'Useful: Sản phẩm có giải quyết được nhu cầu thực sự, có ý nghĩa với user không?',
          'Usable: Sản phẩm có dễ sử dụng, thao tác trực quan không?',
          'Findable: Nội dung/tính năng có dễ tìm thấy, cấu trúc điều hướng rõ ràng không?',
          'Accessible: Người khuyết tật có thể sử dụng được sản phẩm không?',
          'Desirable: Thiết kế có gợi cảm xúc tích cực, tạo mong muốn sử dụng không?',
          'Credible: User có tin tưởng vào thông tin/thương hiệu của sản phẩm không?',
          'Valuable: Sản phẩm có mang lại giá trị thực cho cả user lẫn business không?'
        ]
      }
    ]
  },
  {
    id:'D', title:'Cognitive & Perceptual',
    desc:'Đánh giá dựa trên tâm lý học nhận thức (mental) và tri giác thị giác (visual).',
    frameworks:[
      {
        id:'cog-load', name:'Cognitive Load',
        purpose:'Kiểm tra tải nhận thức mà UI đặt lên working memory của user — bị giới hạn như "RAM" của não bộ.',
        when:'UI phức tạp, dashboard nhiều dữ liệu, form dài, flow nhiều bước.',
        criteria:[
          'Intrinsic load: Độ phức tạp vốn có của task đã được chunk (chia nhỏ) thành các bước hợp lý chưa?',
          'Extraneous load: Có loại bỏ được yếu tố gây rối/distraction không liên quan trực tiếp đến task chính?',
          'Germane load: Thiết kế có giúp user xây dựng đúng mental model về cách hệ thống vận hành (và được tối đa hoá)?'
        ]
      },
      {
        id:'laws-of-ux', name:'Laws of UX (10 quy luật tâm lý học)',
        purpose:'Áp dụng các nguyên lý tâm lý học nhận thức đã được nghiên cứu vào chi tiết thiết kế.',
        when:'Review chi tiết micro-interaction, bố cục, timing phản hồi, copy giao diện.',
        criteria:[
          "Hick's Law: Số lượng lựa chọn có được tối giản để giảm thời gian ra quyết định không?",
          "Miller's Law: Mỗi nhóm thông tin có được chunk còn khoảng ~4 (hoặc 7±2) items để dễ nhớ không?",
          "Fitts's Law: Kích thước và khoảng cách của target chạm/click đã được tối ưu chưa?",
          "Jakob's Law: Thiết kế có tuân theo quy ước quen thuộc mà user đã học từ các sản phẩm khác không?",
          "Tesler's Law (Conservation of Complexity): Độ phức tạp còn lại đã được đặt đúng chỗ (hệ thống xử lý thay vì đẩy hết cho user)?",
          'Peak-End Rule: Trải nghiệm có được thiết kế với 1 điểm cao trào tích cực và 1 kết thúc ấn tượng không?',
          'Zeigarnik Effect: Có tận dụng cảm giác "việc dở dang" (progress bar, completion meter) để giữ user quay lại không?',
          'Serial Position Effect: Các mục nav/thông tin quan trọng có được đặt ở đầu hoặc cuối danh sách (dễ nhớ nhất)?',
          'Von Restorff Effect: CTA chính có đủ nổi bật so với phần còn lại, và không bị lạm dụng (mọi thứ đều nổi bật = không gì nổi bật)?',
          'Loss Aversion: Thông điệp/giá trị có được framing theo hướng "tránh mất mát" khi phù hợp với ngữ cảnh?',
          'Doherty Threshold: Thời gian phản hồi hệ thống có được giữ dưới 400ms để duy trì flow tương tác?'
        ]
      },
      {
        id:'gestalt', name:'Gestalt Principles',
        purpose:'Nguyên lý thị giác giải thích cách não bộ nhóm và diễn giải các thành phần trên màn hình.',
        when:'Review layout, spacing, alignment, phân nhóm nội dung trên giao diện.',
        criteria:[
          'Proximity: Các phần tử liên quan có được đặt gần nhau để ngầm hiểu là 1 nhóm không?',
          'Similarity: Các phần tử cùng chức năng có dùng chung style (màu, hình, size) để dễ nhận diện nhóm?',
          'Common region: Các nhóm nội dung có được phân tách rõ bằng border/background khi cần?',
          'Closure: Mắt người dùng có tự "khép kín" được hình dạng dù thiếu 1 phần chi tiết không gây hiểu sai?',
          'Continuity: Bố cục có dẫn mắt user đi theo 1 luồng liền mạch, tự nhiên không?',
          'Figure-Ground: Nội dung chính (figure) có tách bạch rõ khỏi nền (ground), không bị lẫn?',
          'Simplicity: Tổng thể thiết kế có được đơn giản hoá tối đa, tránh chi tiết thừa gây nhiễu?'
        ]
      }
    ]
  },
  {
    id:'E', title:'Accessibility & Inclusive Design',
    desc:'Đảm bảo mọi người, kể cả người khuyết tật, đều có thể sử dụng được sản phẩm.',
    frameworks:[
      {
        id:'pour', name:'Accessibility Guideline — POUR',
        purpose:'4 nguyên tắc nền tảng của WCAG để đảm bảo khả năng tiếp cận của sản phẩm.',
        when:'Accessibility audit, đặc biệt trước khi release sản phẩm public-facing.',
        criteria:[
          'Perceivable: Thông tin có được truyền tải qua nhiều giác quan (không chỉ màu sắc, không chỉ âm thanh)?',
          'Operable: User có thể thao tác/vận hành sản phẩm bằng nhiều phương thức (bàn phím, chuột, touch, voice)?',
          'Understandable: Thông tin và hành vi hệ thống có rõ ràng, dễ đoán trước (predictable) không?',
          'Robust: Cấu trúc nội dung có đủ chuẩn để các công nghệ hỗ trợ (screen reader...) diễn giải đúng không?'
        ]
      },
      {
        id:'human-dimension', name:'Human Dimension (Nhóm khuyết tật)',
        purpose:'Xem xét thiết kế có accommodate được các nhóm khuyết tật khác nhau.',
        when:'Đi kèm với POUR, đặc biệt khi thiết kế component tương tác phức tạp (voice, gesture, media).',
        criteria:[
          'Visual: Sản phẩm có dùng được cho người khiếm thị/thị lực yếu (contrast, alt text, screen reader)?',
          'Motor: Sản phẩm có dùng được cho người hạn chế vận động (target size, không yêu cầu thao tác tinh vi)?',
          'Cognitive: Sản phẩm có dễ hiểu cho người gặp khó khăn về nhận thức/ghi nhớ không?',
          'Auditory: Nội dung âm thanh có phụ đề/transcript cho người khiếm thính không?',
          'Speech: Có phương án thay thế cho user gặp khó khăn khi giao tiếp bằng giọng nói (voice command)?'
        ]
      },
      {
        id:'context-dimension', name:'Context Dimension (Hoàn cảnh sử dụng)',
        purpose:'Hạn chế khả năng sử dụng có thể là Permanent, Temporary, hoặc Situational — không chỉ người khuyết tật vĩnh viễn mới cần accessibility.',
        when:'Thiết kế cho tình huống thực tế: 1 tay đang bận, ánh sáng chói, môi trường ồn ào...',
        criteria:[
          'Permanent: Sản phẩm có tính đến trường hợp khuyết tật vĩnh viễn (mù, điếc, liệt...)?',
          'Temporary: Sản phẩm có dùng được khi user gặp hạn chế tạm thời (gãy tay, mới phẫu thuật mắt...)?',
          'Situational: Sản phẩm có dùng được trong hoàn cảnh bất lợi (1 tay bế con, ngoài trời nắng, nơi ồn ào...)?'
        ]
      }
    ]
  }
];
