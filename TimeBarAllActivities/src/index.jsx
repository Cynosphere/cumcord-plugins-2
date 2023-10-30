import {find} from "@cumcord/modules/webpack";
import {instead} from "@cumcord/patcher";
import {React} from "@cumcord/modules/common";

const UserActivity = find((m) => m?.Types?.PROFILE_V2);
const ActivityTimeBar = find((m) => m?.defaultProps?.themed != null);

const patches = [];

export default (data) => ({
  onLoad() {
    patches.push(
      instead("renderTimeBar", UserActivity.prototype, function ([activity]) {
        const {timestamps} = activity;
        if (!timestamps) return null;
        const {start, end} = timestamps;
        if (!start || !end) return null;

        return (
          <ActivityTimeBar
            start={start}
            end={end}
            className={this.getTypeClass("timeBar")}
            themed={
              this.props.type === UserActivity.Types.VOICE_CHANNEL ||
              this.props.type === UserActivity.Types.USER_POPOUT ||
              this.props.type === UserActivity.Types.USER_POPOUT_V2 ||
              this.props.type === UserActivity.Types.PROFILE_V2
            }
          />
        );
      })
    );
    patches.push(
      instead(
        "renderTimePlayed",
        UserActivity.prototype,
        function (args, orig) {
          const [activity] = args;
          if (
            activity.timestamps != null &&
            activity.timestamps.start != null &&
            activity.timestamps.end != null
          )
            return null;

          return orig(args);
        }
      )
    );
  },
  onUnload() {
    for (const unpatch of patches) {
      unpatch?.();
    }
  },
});
