export const parseHouseItems = (items) => {
  return items.map((item) => {
    const id = item.getAttribute('data-id');
    const topTagEl = item.querySelector('.tag .top.tag-item');
    const titleEl = item.querySelector('.item-info-title a.link');
    const priceEl = item.querySelector('.item-info-price .inline-flex-row');
    // const imgEl = item.querySelector('.image-list img[data-src]');
    const tagEls = item.querySelectorAll('.item-info-tag .tag');
    const houseInfoEl = item.querySelector(
      '.item-info-txt .ic-house.house-home'
    );
    const locationEl = item.querySelector(
      '.item-info-txt .ic-house.house-place'
    );
    const metroEl = item.querySelector('.item-info-txt .house-metro');
    const roleNameEl = item.querySelector('.item-info-txt.role-name');

    const isTop = !!topTagEl;
    const title = titleEl
      ? titleEl.getAttribute('title') || titleEl.innerText.trim()
      : '無標題';
    const link = titleEl ? titleEl.href : '';
    const price = priceEl ? priceEl.innerText.trim() : '無價格';
    // const image = imgEl ? imgEl.getAttribute('data-src') : '';
    const tags = [...tagEls].map((el) => el.innerText.trim());

    let roomType = '';
    let area = '';
    let floor = '';
    if (houseInfoEl) {
      const parentEl = houseInfoEl.parentNode;
      const typeSpan = parentEl.querySelector('span:not(.line)');
      roomType = typeSpan ? typeSpan.innerText.trim() : '';

      const lineEls = parentEl.querySelectorAll('.line .inline-flex-row');
      if (lineEls[0]) {
        area = lineEls[0].innerText.trim();
      }
      if (lineEls[1]) {
        floor = lineEls[1].innerText.trim();
      }
    }

    let location = '';
    if (locationEl) {
      const locationDiv =
        locationEl.parentNode.querySelector('.inline-flex-row');
      location = locationDiv
        ? locationDiv.innerText.trim()
        : locationEl.parentNode.innerText.trim();
    }

    let metroStation = '';
    let metroDistance = '';
    if (metroEl) {
      const parentEl = metroEl.parentNode;
      const stationSpan = parentEl.querySelector('span');
      const distanceStrong = parentEl.querySelector('strong');
      metroStation = stationSpan ? stationSpan.innerText.trim() : '';
      metroDistance = distanceStrong ? distanceStrong.innerText.trim() : '';
    }

    let contact = '';
    let updateTime = '';
    let viewCount = '';
    if (roleNameEl) {
      const contactSpan = roleNameEl.querySelector('span:not(.line)');
      contact = contactSpan ? contactSpan.innerText.trim() : '';

      const lineSpans = roleNameEl.querySelectorAll('span.line');
      lineSpans.forEach((span) => {
        const text = span.innerText.trim();
        if (text.includes('更新')) {
          updateTime = text;
        } else if (text.includes('瀏覽')) {
          viewCount = text;
        }
      });
    }

    return {
      id,
      isTop,
      title,
      price,
      // image,
      tags,
      roomType,
      area,
      floor,
      location,
      metroStation,
      metroDistance,
      contact,
      updateTime,
      viewCount,
      link,
    };
  });
};
