import React, { Component } from "react";
import { getDateName, sixteen2Rgb } from "./utils";
import "./index.css";

export default class extends Component {
  static defaultProps = {
    collapse: false,
    lunerVisible: true,
    showToday: true,
    showWeek: false,
    activeStyle: {},
    value: false,
    hot: false, 
    renderHeader: false,
    renderFooter: false,
    renderDateFooter: false,
    colorStyle: "#00CC73",
    showLastNext: true
  };

  constructor() {
    super(...arguments);
    const { value } = this.props;
    let realDate;
    if (
      !value ||
      (typeof value !== "number" &&
      Object.prototype.toString.call(value) !== "[object Date]")
    ) {
      realDate = new Date();
    } else {
      realDate = new Date(value);
    }
    this.state = {
      date: realDate
    };
  }

  componentDidUpdate = prevProps => {
    const { value: prevValue } = prevProps;
    const { value } = this.props;
    if (
      prevValue !== value &&
      (typeof value === "number" ||
        Object.prototype.toString.call(value) === "[object Date]")
    ) {
      let realDate = new Date(value);
      this.setState({
        date: realDate
      });
    }
  };

  week = [
    {
      type: "week",
      value: "日"
    },
    {
      type: "week",
      value: "一"
    },
    {
      type: "week",
      value: "二"
    },
    {
      type: "week",
      value: "三"
    },
    {
      type: "week",
      value: "四"
    },
    {
      type: "week",
      value: "五"
    },
    {
      type: "week",
      value: "六"
    }
  ];

  _value

  get value(){
    return this.state.date
  }

  handleClick = item => {
    const { date } = item;
    const { value } = this.props;
    if (!value) {
      this.setState({
        date
      });
    }
    this.props.onChange && this.props.onChange(date);
  };

  //获取当前月第一天(周)
  getMonthStart = (
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear()
  ) => new Date(year, month - 1);

  //获取月最后一天(周)
  getMonthEnd = (
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear()
  ) => new Date(year, month, 0);

  //获取当前月天数
  getMonthDays = (
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear()
  ) => new Date(year, month, 0).getDate();

  //获取需要显示的日期数据
  getVisibleDate = () => {
    const { collapse, showLastNext } = this.props;
    const { date } = this.state;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const day = date.getDate()
    let visibleDate = [...this.week];
    if(!collapse) {
      const first = this.getMonthStart(month, year).getDay();
      const last = this.getMonthEnd(month, year).getDay();
      const _date = new Date(year, month - 2);
      const prevMonthDays = this.getMonthDays(
        _date.getMonth() + 1,
        _date.getFullYear()
      );
      visibleDate = [
        ...visibleDate,
        ...new Array(showLastNext ? first : 0).fill(0).map((_, index) => ({
          type: "last",
          value: prevMonthDays - first + index + 1,
          date: new Date(year, month - 2, prevMonthDays - first + index + 1)
        })),
        ...new Array(this.getMonthDays(month, year)).fill(0).map((_, index) => ({
          type: "now",
          value: index + 1,
          date: new Date(year, month - 1, index + 1)
        })),
        ...new Array(showLastNext ? 6 - last : 0).fill(0).map((_, index) => ({
          type: "next",
          value: index + 1,
          date: new Date(year, month, index + 1)
        }))
      ];
      return visibleDate
    }
    let [weekStart] = this.getThisWeek(new Date(year, month - 1, day));
    visibleDate = [
      //更改顺序
      ...[...visibleDate.slice(1), ...visibleDate.slice(0, 1)],
      ...new Array(7).fill(0).map(_ => {
        const date = {
          type: 'now',
          value: weekStart.getDate(),
          date: new Date(weekStart)
        }
        weekStart.setDate(weekStart.getDate() + 1)
        return date
      })
    ]
    return visibleDate
  };

  //时间改变
  changeDate = (type, isNext, _value=false) => {
    const { date } = this.state;
    const { value } = this.props
    const _date = (!!_value && _value) || (!!value && value) || date
    const year = _date.getFullYear();
    const month = _date.getMonth() + 1;
    const day = _date.getDate();
    const realDate = new Date(year, month - 1, day);
    const num = Math.pow(-1, Number(isNext));
    switch (type) {
      case "week":
        realDate.setDate(day + 7 * num);
        break;
      case "month":
        realDate.setMonth(month - 1 + num);
        break;
      case "year":
        realDate.setFullYear(year + num);
        break;
      case "day":
      default:
        realDate.setDate(day + num);
        break;
    }
    if(_value === false && value === false) {
      this.setState({
        date: realDate
      });
    }else if(_values === false) {
      this.props.onChange && this.props.onChange(realDate)
    }
    return realDate
  };

  next = (type, date) => this.changeDate(type, true, date);

  last = (type, date) => this.changeDate(type, false, date);

  lastYear = (date) => this.last("year", date);

  lastMonth = (date) => this.last("month", date);

  lastWeek = (date) => this.last("week", date);

  lastDay = (date) => this.last("day", date);

  nextYear = (date) => this.next("year", date);

  nextMonth = (date) => this.next("month", date);

  nextWeek = (date) => this.next("week", date);

  nextDay = (date) => this.next("day", date);

  getThisWeek = date => {
    const weekDay = date.getDay();
    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    return [
      new Date(year, month, day - weekDay + 1),
      new Date(year, month, day + 7 - weekDay)
    ];
  };

  //是否为active区域
  isActive = ({ type, date: value }) => {
    const { showToday, showWeek } = this.props;
    const { date } = this.state;
    if (showWeek) {
      const [start, end] = this.getThisWeek(date);
      return (
        start.getTime() <= value.getTime() && end.getTime() >= value.getTime()
      );
    } else if (showToday) {
      return date.getDate() === value.getDate() && type === "now";
    }
    return false;
  };

  basicColor = () => ({ color: this.props.colorStyle });

  itemColorStyle = type => ({
    color:
      type !== "now"
        ? sixteen2Rgb(
            this.props.colorStyle,
            rgb =>
              `rgb(${new Array(3)
                .fill(
                  Math.floor(rgb.reduce((acc, item) => (acc += item), 0) / 3)
                )
                .join(",")}, 0.8)`
          )
        : sixteen2Rgb(
            this.props.colorStyle,
            rgb =>
              `rgb(${new Array(3).fill(
                Math.floor(rgb.reduce((acc, item) => (acc += item), 0) / 5)
              )})`
          )
  });

  dateColorStyle = (item, nextStyle) => ({
    ...(this.isActive(item)
      ? {
          backgroundColor: this.props.colorStyle,
          color: sixteen2Rgb(
            this.props.colorStyle,
            rgb => `rgb(${rgb.map(color => 255 - color).join(",")})`
          ),
          ...nextStyle
        }
      : {})
  });

  lunerColorStyle = active => ({
    color: active
      ? sixteen2Rgb(this.props.colorStyle, rgb => {
          const max = Math.max.apply(null, rgb);
          const index = rgb.indexOf(max);
          const newRgb = new Array(3).fill(0);
          newRgb[index] = max;
          return `rgb(${newRgb.join(",")})`;
        })
      : sixteen2Rgb(
          this.props.colorStyle,
          rgb =>
            `rgb(${new Array(3)
              .fill(Math.floor(rgb.reduce((acc, item) => (acc += item), 0) / 3))
              .join(",")}, 0.6)`
        )
  });

  hotColorStyle = () => ({
    backgroundColor: sixteen2Rgb(this.props.colorStyle, rgb => {
      const max = Math.max.apply(null, rgb);
      const index = rgb.indexOf(max);
      const newRgb = new Array(3).fill(0);
      newRgb[index] = max * 2 > 255 ? 255 : max * 2;
      return `rgb(${newRgb.join(",")})`;
    })
  });

  render() {
    const {
      collapse,
      lunerVisible,
      activeStyle,
      hot,
      showLastNext
    } = this.props;
    const { date } = this.state;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const list = this.getVisibleDate();

    return (
      <div className="glf-calendar">
        {this.props.renderHeader && (
          <div className="glf-calendar-header">
            {this.props.renderHeader(new Date(year, month - 1, day))}
          </div>
        )}
        <div
          className="glf-calendar-content"
          style={{
            gridTemplateRows: `repeat(${
              collapse ? 2 : Math.ceil(list.length / 7)
            }, 1fr)`
          }}
        >
          {list.map((item, index) => {
            const { value, date, type } = item;
            const { holiday, active } = getDateName(date);
            const day = date && date.getDay();
            return index <= 6 ? (
              <div
                key={index}
                className="glf-calendar-item glf-calendar-content-week"
                style={{ ...this.basicColor() }}
              >
                {value}
              </div>
            ) : (
              <div
                key={index}
                className={`glf-calendar-item glf-calendar-content-days`}
                style={{
                  ...(!showLastNext && type === "now" && date.getDate() === 1
                    ? { gridColumnStart: date.getDay() + 1 }
                    : {}),
                  ...this.itemColorStyle(type)
                }}
                onClick={this.handleClick.bind(this, item)}
              >
                <div className="glf-calendar-item-main">
                  <div
                    className={`glf-calendar-date ${
                      this.isActive(item) ? "glf-calendar-default-active" : ""
                    }`}
                    style={{
                      ...this.dateColorStyle(item, activeStyle),
                      fontWeight: day === 0 || day === 6 ? "500" : "400"
                    }}
                  >
                    {value}
                  </div>
                  {lunerVisible && (
                    <div
                      className={`glf-calendar-lunar`}
                      style={{ ...this.lunerColorStyle(active) }}
                    >
                      {holiday}
                    </div>
                  )}
                </div>
                {hot &&
                  (Array.isArray(hot)
                    ? hot.some(
                        hotDate =>
                          Object.prototype.toString.call(hotDate) ===
                            "[object Date]" &&
                          hotDate.getFullYear() === date.getFullYear() &&
                          hotDate.getMonth() === date.getMonth() &&
                          hotDate.getDate() === date.getDate()
                      )
                    : typeof hot === "function"
                    ? hot(date)
                    : false) && (
                    <div
                      className="glf-calendar-hot"
                      style={{ ...this.hotColorStyle() }}
                    />
                  )}
                <div className="glf-calendar-slot">
                  {this.props.renderDateFooter
                    ? typeof this.props.renderDateFooter === "function"
                      ? this.props.renderDateFooter(date)
                      : this.props.renderDateFooter
                    : ""}
                </div>
              </div>
            );
          })}
        </div>
        {this.props.renderFooter && (
          <div className="glf-calendar-footer">
            {this.props.renderFooter(new Date(year, month - 1, day))}
          </div>
        )}
      </div>
    );
  }
}
