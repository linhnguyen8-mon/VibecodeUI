import { skills } from "./skills";
import translations from "./qaSkillTranslations.json";
const vi: Record<string, string> = {
  "Product Logic": "Logic sản phẩm", "Information & Flow": "Thông tin & luồng", "Interaction & States": "Tương tác & trạng thái", "Cognitive UX": "Nhận thức UX", "Visual Quality": "Chất lượng thị giác", "System Quality": "Chất lượng hệ thống", "Trust & Accessibility": "Tin cậy & khả năng tiếp cận",
  "skills": "kỹ năng", "Choose a skill to inspect its criteria": "Chọn kỹ năng để xem checklist", "Clear filters": "Xóa bộ lọc", "Clear all": "Xóa tất cả", "Problem": "Vấn đề", "What feels wrong?": "Điểm nào chưa ổn?", "All issues": "Tất cả vấn đề", "Audit Sets": "Bộ audit", "All skills": "Tất cả kỹ năng", "Purpose": "Mục đích", "Detects": "Vấn đề cần tìm", "When to use": "Khi nào sử dụng", "Context inputs": "Thông tin bổ sung", "Reset": "Đặt lại", "Audit checklist": "Checklist đánh giá", "Not assessed": "Chưa đánh giá", "Pass": "Đạt", "Fail": "Không đạt", "Needs Review": "Cần xem lại", "Include in prompt": "Đưa vào prompt", "Notes": "Ghi chú", "Notes / findings…": "Ghi chú / phát hiện…", "checked": "đã kiểm tra", "Hard rules": "Quy tắc bắt buộc", "AI slop signals": "Dấu hiệu thiết kế AI chung chung", "Design principles": "Nguyên tắc thiết kế", "Framework sources": "Nguồn framework", "Generated Prompt": "Prompt tạo sẵn", "Preview prompt": "Xem prompt", "Copy Audit Prompt": "Copy prompt audit", "Copy Criteria Only": "Copy tiêu chí", "Copied": "Đã copy", "Criteria copied": "Đã copy tiêu chí", "Required": "Bắt buộc",
  "Usability": "Dễ sử dụng", "Trust": "Tin cậy", "Conversion": "Chuyển đổi", "Navigation": "Điều hướng", "Complexity": "Độ phức tạp", "Consistency": "Nhất quán", "Accessibility": "Khả năng tiếp cận", "AI Slop": "Thiết kế AI chung chung",
  "Looks generic": "Thiếu nét riêng", "Hard to understand": "Khó hiểu", "Hard to navigate": "Khó điều hướng", "Too cluttered": "Quá rối", "Too empty": "Quá trống", "Flow feels awkward": "Luồng chưa thuận tiện", "Missing states": "Thiếu trạng thái", "UI inconsistent": "Giao diện thiếu nhất quán", "Doesn't feel trustworthy": "Thiếu tin cậy",
  "Target screen or flow": "Màn hình hoặc luồng cần đánh giá", "Known concern": "Vấn đề đã biết", "Name the screen, flow, or feature": "Tên màn hình, luồng hoặc tính năng", "What should the review pay extra attention to?": "Điều gì cần chú ý khi đánh giá?",
  "Tie findings to observable evidence.": "Gắn phát hiện với bằng chứng quan sát được.", "Separate evidence from assumptions.": "Phân biệt bằng chứng và giả định.",
};
const en: Record<string, string> = {};
Object.assign(vi, {
  Triage: "Quét nhanh", Flow: "Luồng", Content: "Nội dung", Visual: "Thị giác", Build: "Triển khai",
  "Flow / screens": "Luồng / màn hình", "User & goal": "Người dùng & mục tiêu", Artifact: "Tài liệu / giao diện", "Known concern": "Vấn đề đã biết",
  "e.g. Checkout: Cart → Shipping → Payment → Success": "VD: Thanh toán: Giỏ hàng → Giao hàng → Thanh toán → Thành công",
  "e.g. Returning buyer wants to reorder in < 1 min": "VD: Khách cũ muốn đặt lại trong dưới 1 phút",
  "Link, screenshots, or code path": "Link, ảnh chụp hoặc đường dẫn code", "What to look at first?": "Cần xem điều gì trước?",
  "Job story": "Job story", Domain: "Lĩnh vực", Task: "Tác vụ", "Success state": "Trạng thái thành công", "Screen list": "Danh sách màn hình", "Expected branches": "Nhánh dự kiến", "Async events": "Sự kiện bất đồng bộ", "Failure scenarios": "Tình huống lỗi", "User terms": "Thuật ngữ người dùng", "Real data source": "Nguồn dữ liệu thật", "Sensitive data": "Dữ liệu nhạy cảm", "Primary action": "Hành động chính", "Design system source": "Nguồn design system", "Known exceptions": "Ngoại lệ đã biết", Viewports: "Kích thước màn hình",
});
export const translatedSummaries = Object.fromEntries(skills.map(skill => [skill.id, skill.cardEN]));
for (const skill of skills) {
  const localized = translations[skill.id as keyof typeof translations];
  vi[skill.name] = localized.nameVI;
  en[skill.shortDescription] = skill.cardEN;
  en[skill.whenToUse] = localized.whenEN;
  skill.criteria.forEach((criterion, index) => {
    vi[criterion.title] = localized.criteria[index].titleVI;
    en[criterion.description] = localized.criteria[index].descriptionEN;
  });
}
export function translateAudit(text: string, language: "en" | "vi"): string {
  return (language === "vi" ? vi[text] : en[text]) || text;
}

Object.assign(vi, {
  "Run this first. Use findings to choose a recommended deep-dive.": "Chạy đầu tiên; dùng phát hiện để chọn skill đánh giá sâu.",
  "Apply criteria 2–4 at every step; record each failed step.": "Áp dụng tiêu chí 2–4 cho từng bước; ghi lại mỗi bước không đạt.",
  "Screenshots cannot verify exact contrast or keyboard behavior. Mark criteria 1 and 4 as review until verified with tools and manual testing.": "Ảnh chụp không xác minh được tương phản chính xác hoặc bàn phím. Đánh review ở tiêu chí 1 và 4 đến khi kiểm tra bằng công cụ và thao tác thật.",
});

Object.assign(vi, {
  "Choose 3–4 skills per review to keep the audit focused.": "Chọn 3–4 skill mỗi lượt để audit tập trung.",
  "AI-gen minimum": "AI-gen tối thiểu", "Onboarding / Signup": "Onboarding / Đăng ký", "Checkout / Payment": "Checkout / Thanh toán", "Dashboard / Data": "Dashboard / Dữ liệu", "Landing page": "Landing page", "Dev handoff": "Bàn giao dev",
  "Start with the minimum review for every AI-generated flow.": "Bắt đầu với bộ tối thiểu cho mọi flow AI-gen.",
  "Run after the AI-gen minimum: task flow, cognitive load, and recovery.": "Chạy sau bộ AI-gen tối thiểu: tác vụ, tải nhận thức và phục hồi.",
  "Run after the AI-gen minimum: task flow, recovery, and accessibility.": "Chạy sau bộ AI-gen tối thiểu: tác vụ, phục hồi và khả năng tiếp cận.",
  "Run after the AI-gen minimum: comprehension, hierarchy, and states.": "Chạy sau bộ AI-gen tối thiểu: nhận thức, phân cấp và trạng thái.",
  "Run after the AI-gen minimum: purpose, hierarchy, and visual slop.": "Chạy sau bộ AI-gen tối thiểu: mục tiêu, phân cấp và trang trí thừa.",
  "Review components, responsive behavior, and accessibility before handoff.": "Kiểm tra component, responsive và khả năng tiếp cận trước bàn giao.",
});
