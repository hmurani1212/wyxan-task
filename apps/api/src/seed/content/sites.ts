export interface SeedSite {
  address: string;
  title: string;
  author: string;
  publishedAt: string;
  html: string;
}

/**
 * Ten pages, written to be wandered. Every site links to at least two others;
 * the web is a single loop with a few shortcuts across it, and five addresses
 * that were never published at all.
 */
export const SITES: SeedSite[] = [
  {
    address: 'tidepool.zz',
    title: 'The tide pool at the end of the lane',
    author: 'maren',
    publishedAt: '2026-08-14T09:20:00.000Z',
    html: `
<h1>The tide pool at the end of the lane</h1>
<p>At the bottom of the lane there is a shelf of dark rock that only exists for six hours a day. The rest of the time it is a rumour under green water. I have been visiting it since I was small enough to need both hands to climb down, and it has never once been the same pool twice.</p>
<p>A tide pool is not a small aquarium. It is a queue. Everything in it is waiting for the water to come back, and everything in it is also eating something else that is waiting. The anemones open like wet flowers. The crabs take the shaded side of a stone and stay there, pretending to be geology.</p>

<h2>What is in it, this week</h2>
<ul>
  <li><strong>Beadlet anemones</strong>, dozens of them, most closed and the colour of a bruise.</li>
  <li><strong>Flat periwinkles</strong> on the bladder wrack, small as a fingernail.</li>
  <li>One <strong>shore crab</strong> under the third stone from the left, who has been there since June.</li>
  <li>A single <strong>pipefish</strong>, which is the most exciting thing that has happened to me this month.</li>
</ul>

<p>The water in the pool was warm at the edge and cold at the bottom, which is how you can tell a pool is deep enough to keep something alive through a hot afternoon. I put my hand in and the anemones closed one after another, a slow wave of suspicion travelling across the rock.</p>

<blockquote>Nothing at the tideline is wasted. It is only rearranged, and sometimes eaten.</blockquote>

<h2>Elsewhere on this web</h2>
<p>My longer notes on the grass and the channels are at <a href="saltmarsh.zz">saltmarsh.zz</a>, which I keep meaning to tidy. Ivo has a lovely piece about the light that used to be shown across this same water at <a href="lantern.zz">lantern.zz</a>. There was a proper survey of the pool in 1974, at <a href="brinewell.zz">brinewell.zz</a>, but that address has been dead for years and I have stopped hoping.</p>
<p>Bring boots, bring a torch, and do not turn the stones back the wrong way up. The pool has enough trouble without us.</p>
`,
  },
  {
    address: 'saltmarsh.zz',
    title: 'Notes from the salt marsh',
    author: 'maren',
    publishedAt: '2026-08-22T16:05:00.000Z',
    html: `
<h1>Notes from the salt marsh</h1>
<p>The marsh is the tide pool's patient older relative. Where the pool is a queue, the marsh is a ledger: every tide writes a line and the grass keeps the carbon of it. From the sea wall it looks like nothing — a flat green field with a bad haircut. Up close it is all channels, and the channels are full of small lives.</p>

<h2>Spartina, and why it matters</h2>
<p>The cord grass that holds the whole thing together is a stubborn, salt-tolerant thing that traps silt in its stems. Silt becomes mud, mud becomes land, land becomes marsh, and the marsh walks slowly out to sea and back again with the seasons. A marsh is not a place so much as a very slow verb.</p>
<p>I counted forty-one curlew in the east channel at low water, which is more than last year. The warden says counts are a kind of weather rather than a kind of truth: you are measuring your own patience as much as the birds.</p>

<h3>Things the marsh keeps</h3>
<ul>
  <li>Old stakes from a jetty that no longer has a purpose or a name.</li>
  <li>A single blue glass float, half buried, from somebody's net.</li>
  <li>The sound of traffic, arriving from a road you cannot see.</li>
</ul>

<p>Wren has been measuring the rain that feeds these channels, over at <a href="rainfall.zz">rainfall.zz</a>, and has a lovely way of naming the storms. The pool that started all this is at <a href="tidepool.zz">tidepool.zz</a>. For the older history of the marsh I used to point people at <a href="northlight.zz">northlight.zz</a>, though I have not been able to reach it for two winters.</p>

<blockquote>The marsh does not need you to love it. It needs you to stop draining it.</blockquote>
<p>Walk the sea wall at dusk, in the last of the light, when the water in the channels turns the colour of an old mirror. That is the whole of my advice.</p>
`,
  },
  {
    address: 'lantern.zz',
    title: "The lantern keeper's ledger",
    author: 'ivo',
    publishedAt: '2026-07-02T11:40:00.000Z',
    html: `
<h1>The lantern keeper's ledger</h1>
<p>For ninety years somebody sat at the top of a stone tower and wrote down the weather. Not the weather in general — the weather at that exact rock, at that exact hour, with the sea in front of them. The ledgers survive. There are nineteen of them, and I have read all nineteen badly.</p>

<h2>One entry, 3rd November 1931</h2>
<blockquote>
<p>Wind SW, freshening. Lamp trimmed, mantle replaced. A gull in the lamp room, unharmed, furious. Steamer in the roads at four; no signal. Rain from six until past midnight. Nothing else to report.</p>
</blockquote>
<p>The keeper's name is not in the front of the book. It is not anywhere in the book. There is only the handwriting, which changes in small ways over the decades — the loops tightening, then loosening again in old age — and the tower, which is still standing and which nobody has trimmed a lamp in since 1978.</p>

<h2>Why write it down</h2>
<ol>
  <li>Because the log is inspected, and an inspector is a reason to be exact.</li>
  <li>Because the sea is forgetful, and a page is not.</li>
  <li>Because a long night is shorter when you are counting something.</li>
</ol>
<p>The tower is now maintained by two volunteers and a man from the council who is afraid of heights. There is still a light, but it is a small electric one and it is not, whatever the sign says, a lantern.</p>

<p>If you want the wiring, that is <a href="copperwire.zz">copperwire.zz</a>. The path out to the tower is written up at <a href="tinners.zz">tinners.zz</a>. I have kept a scan of the 1931 ledgers at <a href="wireless.zz">wireless.zz</a> for years, but the scans never load and I have given up on them.</p>
<p>Bring a coat. It is always colder up there than the car park suggests.</p>
`,
  },
  {
    address: 'copperwire.zz',
    title: 'Copper wire and glass insulators',
    author: 'ivo',
    publishedAt: '2026-07-19T08:15:00.000Z',
    html: `
<h1>Copper wire and glass insulators</h1>
<p>Every valley where I grew up had a line of poles along it, and every pole wore a small green or brown glass hat. The hats are insulators. They kept the bare copper from grounding itself on wet wood, and they made a clicking sound in dry weather that I still associate with the sound of summer.</p>

<h2>Walking the line</h2>
<p>The line went from the exchange to a farm, then to another farm, then to a house with a telephone that was mostly used to report snow. The wire sagged in the summer and sang in the wind. When the line was replaced with a cable in the nineteen eighties, the poles were left standing, and the glass hats stayed up there for another twenty years until boys with air rifles discovered them.</p>

<h3>How to read a pole</h3>
<ul>
  <li><strong>One wire</strong> means a single telephone, or more likely a fence. Look for the insulator before you get your hopes up.</li>
  <li><strong>Two wires</strong> means a circuit with a return, and possibly a subscriber who complained about the volume.</li>
  <li><strong>Many wires</strong> means an exchange, and someone who had to climb it in the rain.</li>
</ul>

<p>The glass is collectable and I have three: a clear green one, a brown one with a chip, and one the colour of milk that I found in a hedge and will not sell for any money. The keeper's log that these lines once served is at <a href="lantern.zz">lantern.zz</a>. The path under the route is at <a href="tinners.zz">tinners.zz</a>. There is a marvellous old cable schedule at <a href="almanac.zz">almanac.zz</a>, or there was, before it went dark.</p>

<blockquote>Any sufficiently old technology is a landscape feature.</blockquote>
<p>Walk the line while the light is low. The wire collects it and for a moment the whole valley is strung with something bright.</p>
`,
  },
  {
    address: 'rainfall.zz',
    title: 'A small atlas of rain',
    author: 'wren',
    publishedAt: '2026-09-03T07:30:00.000Z',
    html: `
<h1>A small atlas of rain</h1>
<p>I keep a rain gauge in the garden, and every morning I write the number in a book. It is a ridiculous habit and I recommend it. After a year you have not got the weather; you have got a portrait of a year, in millimetres.</p>

<h2>Four rains</h2>
<p><strong>Frontal rain</strong> arrives politely, from a direction, with an hour's warning. It does the most good and gets the least credit. <strong>Convective rain</strong> is the afternoon kind: abrupt, local, and personally offended by your washing. <strong>Orographic rain</strong> happens when a hill makes a cloud give up. If you live on the west side of a hill, this is most of your weather. <strong>Drizzle</strong> is not rain with the volume turned down; it is a different thing entirely, and it will soak you through while your gauge pretends nothing happened.</p>

<h2>The gauge</h2>
<ul>
  <li>A straight-sided tin, a funnel, and a marked stick is enough to begin.</li>
  <li>Read at the same hour every day, even the dry ones. Especially the dry ones.</li>
  <li>Empty it after reading, or the next day is a lie.</li>
</ul>
<p>My best year was the one with the wet June, when the total crossed a thousand millimetres for the first time since I started. I have not approached it since, and the book has become a record of a wetter decade rather than of my diligence.</p>

<p>The water has to go somewhere, and where it goes is <a href="saltmarsh.zz">saltmarsh.zz</a>. The lanes it runs between are in <a href="paperlanes.zz">paperlanes.zz</a>. I once found a lovely old set of rainfall tables at <a href="northlight.zz">northlight.zz</a>, which I mention only so you can enjoy the same dead end I did.</p>

<blockquote>A gauge measures the sky's opinion of your plans.</blockquote>
`,
  },
  {
    address: 'paperlanes.zz',
    title: 'Paper lanes, folded',
    author: 'wren',
    publishedAt: '2026-09-11T18:45:00.000Z',
    html: `
<h1>Paper lanes, folded</h1>
<p>There is a lane near me that is nine feet wide at one end and eleven at the other, and which appears on no map newer than 1911. I know it is nine feet wide because I measured it with a piece of string, and I know it exists because I walk it twice a week. Maps are a particular kind of confidence.</p>

<h2>How a lane survives</h2>
<p>Lanes survive because somebody has a right of way, or because a wall is older than the idea of moving it, or because nobody has yet wanted the land enough. They die when a new road is drawn across them, or when a developer buys both sides and forgets the middle. The paper record and the ground record drift apart, politely at first, then completely.</p>
<p>I have been folding maps of the town to see which creases line up with the lanes. Fold a map four times and the creases become a grid. Fold it seven times and it becomes a small dense thing that fits in a coat pocket and is useless in the rain. There is no way to fold a map into the shape of a town.</p>

<h3>Rules for walking paper lanes</h3>
<ol>
  <li>Take the older map and the newer one. Where they disagree, walk the disagreement.</li>
  <li>Note the numbers on the doors. Numbers are older than names.</li>
  <li>If a lane ends at a wall, look for the gate. There is almost always a gate.</li>
</ol>

<p>The rain that wears the lanes down is measured at <a href="rainfall.zz">rainfall.zz</a>. Nadia keeps a list of the lanes that have gone under water, and a good deal else, at <a href="mothbook.zz">mothbook.zz</a>. There is a wonderful set of town plans at <a href="theoldpier.zz">theoldpier.zz</a> but the address has never once answered.</p>
<p>Fold the map badly. A badly folded map gets used.</p>
`,
  },
  {
    address: 'mothbook.zz',
    title: 'Moths of the north stair',
    author: 'nadia',
    publishedAt: '2026-06-18T21:10:00.000Z',
    html: `
<h1>Moths of the north stair</h1>
<p>There is a light on the north stair that I leave on for one hour after dusk, and a white sheet below it, and a notebook beside that. It is the cheapest possible laboratory and it has taught me more than any book about moths.</p>

<h2>The list so far</h2>
<ul>
  <li><strong>Large yellow underwing</strong> — the first arrival every year, blunt and busy.</li>
  <li><strong>Setaceous Hebrew character</strong> — a name that is longer than the moth, and better than the moth.</li>
  <li><strong>Peppered moth</strong> — still recognisable, still slightly disappointing up close.</li>
  <li><strong>Elephant hawk-moth</strong> — once, in July, and I sat on the step until midnight.</li>
</ul>
<p>Most of them I cannot identify and release anyway. The point is not the list. The point is that the stair becomes a place where something happens, which is more than can be said for most stairs.</p>

<h2>What the light does</h2>
<p>The light does not attract moths because they are foolish. It interferes with a navigation system that was never designed for electric light: they hold a constant angle to a distant moon, and a lamp is not distant. They spiral. You can watch a moth spiral into a bulb and then sit there, stunned, on the white sheet, and feel the particular guilt of having built the lamp.</p>

<p>Harbour rules, which are also about lights and the things they confuse, are at <a href="harbours.zz">harbours.zz</a>. Wren's paper lanes are at <a href="paperlanes.zz">paperlanes.zz</a>. The county moth records used to live at <a href="northlight.zz">northlight.zz</a>, which has been unreachable since the spring, so my list is now the best list I have.</p>
<blockquote>Turn the light off at eleven. The moths have somewhere to be.</blockquote>
`,
  },
  {
    address: 'harbours.zz',
    title: 'Harbour rules, plainly put',
    author: 'nadia',
    publishedAt: '2026-07-28T06:50:00.000Z',
    html: `
<h1>Harbour rules, plainly put</h1>
<p>A harbour is a small government with a very clear mandate: keep the boats apart and the water out. The rules are not written for lawyers. They are written for a man in oilskins at four in the morning, and they have the bluntness of anything that has been tested by weather.</p>

<h2>The rules that matter</h2>
<ol>
  <li><strong>No wash in the inner basin.</strong> Your hurry is not a reason to sink somebody's dinghy.</li>
  <li><strong>Give way to anything under sail, anything under oars, and anything clearly older than you.</strong></li>
  <li><strong>Report a fouled prop, not a fouled temper.</strong></li>
  <li><strong>The tide is not a suggestion.</strong> It is a timetable with no interest in your plans.</li>
</ol>
<p>There is a blackboard by the harbour office with the tide times chalked on it, and beside the blackboard a laminated list of mooring fees that has been laminated so many times the top layer is mostly tape. The whole constitution of the place is on that wall, and it works.</p>

<h2>What the harbour keeps</h2>
<p>It keeps a record of every boat that has ever been registered, in a series of ledgers that smell of diesel and damp. It keeps a bell that is rung for fog and for funerals. It keeps, in a cupboard, a set of brass instruments for a survey that nobody has performed since 1961.</p>

<p>The path down to the point is at <a href="tinners.zz">tinners.zz</a>, and the pool at the end of it is at <a href="tidepool.zz">tidepool.zz</a>. The old pier survey is at <a href="theoldpier.zz">theoldpier.zz</a>, an address I have tried from three different machines without success.</p>
<blockquote>Rules are what a place remembers when nobody is watching.</blockquote>
`,
  },
  {
    address: 'tinners.zz',
    title: "The tinners' path",
    author: 'tomas',
    publishedAt: '2026-05-30T14:25:00.000Z',
    html: `
<h1>The tinners' path</h1>
<p>The path is eleven miles long, which is three miles longer than it needs to be, because it goes around a hill instead of over it. The men who walked it were carrying tin, and tin is heavy, and a hill is heavier. It is a path with a professional opinion.</p>

<h2>What is left</h2>
<p>Stone walls with no roofs. A chimney standing by itself in a field. A shallow pond where a shaft was flooded deliberately in 1893, and a noticeboard that says so in a font that did not exist in 1893. The industry lasted four hundred years and left less behind than a suburb does in four.</p>
<p>You can still find the mortar stones if you know what to look for: round hollows worn into a boulder where ore was crushed by hand. They look like something geological. They are not. A person made each of those hollows, over years, with a hammer and a bad back.</p>

<h3>Walking it</h3>
<ul>
  <li>Start at the sea end, so the hill is behind you and the pub is in front.</li>
  <li>Take water. The streams are not as clean as they look.</li>
  <li>Do not enter a shaft. The county has enough of a job rescuing people who ignored this line.</li>
</ul>

<p>Osric has the old assay figures, and a good deal more, at <a href="bellwether.zz">bellwether.zz</a>. The harbour the tin went to is at <a href="harbours.zz">harbours.zz</a>. The wire that eventually replaced the packhorse is at <a href="copperwire.zz">copperwire.zz</a>.</p>
<blockquote>The path is not a ruin. It is a route that has been out of work for a century.</blockquote>
`,
  },
  {
    address: 'bellwether.zz',
    title: "Bellwether's almanac, 1963",
    author: 'osric',
    publishedAt: '2026-04-12T10:00:00.000Z',
    html: `
<h1>Bellwether's almanac, 1963</h1>
<p>My father kept an almanac every year and wrote in the margins. The 1963 volume is the one I keep by the chair, because 1963 was a year that required marginalia. It has the tide tables, the moon, the market days, and — in pencil, in a hand I know better than my own — the exact dates on which the pond froze.</p>

<h2>From the margins</h2>
<blockquote>
<p>Jan 11. Pond frozen hard enough to walk. Boys on it by ten. Told them off. Went on it myself at four.</p>
<p>Feb 2. Thaw. Two days early by the almanac, which knows nothing.</p>
<p>Aug 19. Swallows gathering on the wire. Early this year. Frost by the middle of September, I will wager.</p>
</blockquote>
<p>He lost the wager. The frost came on the 28th. He wrote that down too, which is the mark of an honest almanac: the predictions stay in the book after they have been proved wrong.</p>

<h2>What an almanac is for</h2>
<p>Not prophecy. An almanac is a way of paying attention on a schedule. It tells you when to look, and then you look, and then you write down what you actually saw. The tide tables in this volume are still broadly correct, because the moon has not changed its habits.</p>

<h3>In this year's edition</h3>
<ul>
  <li>Tide tables, corrected to the minute for the harbour at <a href="harbours.zz">harbours.zz</a>.</li>
  <li>Sunrise, sunset, and the phases of the moon, unchanged and reassuring.</li>
  <li>A list of the paths worth walking in the dry months, beginning with <a href="tinners.zz">tinners.zz</a>.</li>
  <li>Notes on the light at <a href="lantern.zz">lantern.zz</a>, and when it is best seen from the water.</li>
  <li>A page of tide-pool observations from my mother, who walked to <a href="tidepool.zz">tidepool.zz</a> every Sunday of her life.</li>
</ul>
<p>The 1964 volume, and the moth records bound into the back of it, were kept at <a href="mothcatchers.zz">mothcatchers.zz</a>. That address has never resolved for me, and I have stopped writing to it.</p>
<p>Buy a cheap almanac. Write in it. Be wrong in pencil.</p>

<h2>Housekeeping, added by the printer</h2>
<p>This page is stored as HTML that I typed myself, in a box that trusts nobody. The next few lines are the reason the box exists: a script, an image that shouts when it fails to load, and a link that is not an address at all.</p>
<script>alert('the almanac is not a program')</script>
<img src="frozen-pond.png" onerror="alert('the almanac is still not a program')">
<p onmouseover="alert('nor is this paragraph')">A page is a document. It should not be able to do anything except be read.</p>
<p>And the last line is the kind of link found only in bad tutorials: <a href="javascript:alert('no')">this should never be clickable</a>. In a properly built browser, it is not.</p>
`,
  },
];
