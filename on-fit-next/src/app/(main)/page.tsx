import Badge from "@/components/common/Badge";
import RecruitStatus from "@/components/common/RecruitStatus";

export default function Home() {
    return(
        <>
          <Badge type="bronze" text="브론즈" />
          <RecruitStatus type="close" text="모집중" />
        </>
    )
}