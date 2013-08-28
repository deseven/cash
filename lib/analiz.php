<?
class CashAnaliz {
  private $db;
  private $usr;

  private $def_cur = "р.";

  public function __construct($_db, $_usr) {
    $this->db = $_db;
    $this->usr = $_usr;

    //ID=1 - default currency, rate - count money per 1 default
    $this->def_cur = $this->db->element("SELECT c.sign FROM currency c WHERE id = ?", 1 );
  }

  public function getCommon($from, $to) {
    if(!$this->usr->canAnaliz()) return array();

    if(empty($from)) $from = date("Y-m-01");
    if(empty($to)) $to = date("Y-m-d");

    $sql =
    " SELECT
	CASE WHEN c.type = 1 THEN 'Приход' ELSE 'Расход' END || ' ('||SUM(price*qnt*cr.rate)||'".$this->def_cur.")' as tname,
	SUM(price*qnt*cr.rate) data
      FROM `cashes` c
      INNER JOIN currency cr
	ON ( c.cur_id = cr.id )
      WHERE
	c.visible = 1 AND c.bd_id = ?
	AND c.date BETWEEN ? AND ?
      GROUP BY
	c.type
      ORDER BY
	c.type ";

     return $this->db->select($sql, $this->usr->db_id, $from, $to);
  }

  public function getDynamic($from, $to) {
    if(!$this->usr->canAnaliz()) return array();

    //--нарастающий итог - жаль что нет аналитической функции

    if(empty($from)) $from = date("Y-m-01");
    if(empty($to)) $to = date("Y-m-d");

    $sql =
    "SELECT
	c.date as tdate,
	IFNULL(SUM(CASE WHEN type = 0 THEN -1*price*qnt*cr.rate END),0) as out_data,
	IFNULL(SUM(CASE WHEN type = 1 THEN price*qnt*cr.rate END),0) as in_data,
	IFNULL((
	    SELECT
		    SUM(CASE WHEN c1.type = 0 THEN -1 ELSE 1 END  * c1.price*c1.qnt*cr1.rate)
	    FROM
		    `cashes` c1, currency cr1
	    WHERE
		    c1.visible = c.visible AND c1.bd_id = c.bd_id
		    AND cr1.id = c1.cur_id
		    AND c1.date BETWEEN ? AND c.date
	),0) as dif_data
      FROM
	`cashes` c
      INNER JOIN currency cr
	ON ( cr.id = c.cur_id )
      WHERE
	c.visible = 1 AND c.bd_id = ?
	AND c.date BETWEEN ? AND ?
      GROUP BY c.date
      ORDER BY c.date";

      return $this->db->select($sql, $from, $this->usr->db_id, $from, $to);
  }

  public function getGroups($from, $to, $in = 0) {
    if(!$this->usr->canAnaliz()) return array();

    if(empty($from)) $from = date("Y-m-01");
    if(empty($to)) $to = date("Y-m-d");

    $sql =
    "SELECT
	g.name|| ' ('||SUM(c.price*c.qnt*cr.rate)||'".$this->def_cur.")' as tname,
	SUM( c.price * c.qnt * cr.rate ) out_amount
    FROM
      `cashes` c
    INNER JOIN cashes_group g
      ON( g.id = c.`group` )
    INNER JOIN currency cr
      ON( c.cur_id = cr.id )
    WHERE
      c.visible = 1 AND c.bd_id = ? AND c.type = ?
      AND c.date BETWEEN ? AND ?
    GROUP BY
      g.name
    ORDER BY
      out_amount DESC";

    return $this->db->select($sql, $this->usr->db_id, intval($in), $from, $to);
  }

  public function getOrgs($from, $to) {
    if(!$this->usr->canAnaliz()) return array();

    if(empty($from)) $from = date("Y-m-01");
    if(empty($to)) $to = date("Y-m-d");

    $sql =
    "SELECT
	o.name|| ' ('||SUM(c.price*c.qnt*cr.rate)||'".$this->def_cur.")' as tname,
	SUM( c.price * c.qnt * cr.rate ) out_amount
    FROM
      `cashes` c
    INNER JOIN cashes_org o
      ON( o.id = c.org_id )
    INNER JOIN currency cr
      ON( c.cur_id = cr.id )
    WHERE
      c.visible = 1 AND c.bd_id = ? AND c.type = 0
      AND c.date BETWEEN ? AND ?
    GROUP BY
      o.name
    ORDER BY
      out_amount DESC";

    return $this->db->select($sql, $this->usr->db_id, $from, $to);
  }

  public function getPurs($from, $to, $in = 0) {
    if(!$this->usr->canAnaliz()) return array();

    if(empty($from)) $from = date("Y-m-01");
    if(empty($to)) $to = date("Y-m-d");

    $sql =
    "SELECT
      t.name|| ' ('||SUM(c.price*c.qnt*cr.rate)||'".$this->def_cur.")' as tname,
      SUM( c.price * c.qnt * cr.rate ) out_amount
    FROM
      `cashes` c
    INNER JOIN cashes_type t
      ON( t.id = c.cash_type_id )
    INNER JOIN currency cr
      ON( c.cur_id = cr.id )
    WHERE
      c.visible = 1 AND c.bd_id = ? AND c.type = ?
      AND c.date BETWEEN ? AND ?
    GROUP BY
      t.name
    ORDER BY
      out_amount";

    return $this->db->select($sql, $this->usr->db_id, intval($in), $from, $to);
  }

  public function getStorage($amount) {
    if(!$this->usr->canAnaliz()) return array();

    $sql =
    "SELECT
      'Достигнуто ' || SUM( CASE WHEN c.type = 1 THEN 1 ELSE -1 END * c.price * c.qnt * cr.rate ) ||'".$this->def_cur."' as tname,
      SUM( CASE WHEN c.type = 1 THEN 1 ELSE -1 END * c.price * c.qnt * cr.rate ) out_amount
    FROM
      `cashes` c
    INNER JOIN currency cr
      ON( c.cur_id = cr.id )
    WHERE
    c.visible =1 AND c.bd_id = ? ";
    $r = $this->db->select($sql, $this->usr->db_id);

    $amount = intval($amount);
    if($amount == 0) $amount = 1000000;

    $r[1]['out_amount'] = $amount - $r[0]['out_amount'];
    $r[1]['tname'] = 'Осталось '.$r[1]['out_amount'].$this->def_cur;

    return $r;
  }

  public function getMothDyn($from, $to) {
    if(!$this->usr->canAnaliz()) return array();

    if(empty($from)) $from = date("Y-01-01");
    if(empty($to)) $to = date("Y-m-d");

    $sql =
    "SELECT
      strftime('%Y-%m', c.date) as tname,
      IFNULL(SUM( CASE WHEN c.type = 1 THEN c.price * c.qnt * cr.rate END ),0) in_amount,
      IFNULL(SUM( CASE WHEN c.type = 0 THEN  c.price * c.qnt * cr.rate END ),0) out_amount
    FROM
      `cashes` c
    INNER JOIN currency cr
      ON( c.cur_id = cr.id )
    WHERE
      c.visible = 1 AND c.bd_id = ?
      AND c.date BETWEEN ? AND  ?
    GROUP BY
      strftime('%Y-%m', c.date)
    ORDER BY
      tname";

    return $this->db->select($sql, $this->usr->db_id, $from, $to);
  }

  public function getCurAmount($from, $to, $in = 0) {
    if(!$this->usr->canAnaliz()) return array();

    if(empty($from)) $from = date("Y-m-01");
    if(empty($to)) $to = date("Y-m-d");

    $sql =
    "SELECT
      cr.name||', '||SUM( c.price * c.qnt * cr.rate )||'".$this->def_cur."' as tname,
      SUM( c.price * c.qnt * cr.rate ) amount
    FROM
      `cashes` c
    INNER JOIN currency cr
      ON( c.cur_id = cr.id )
    WHERE
      c.visible = 1 AND c.bd_id = ? AND c.type = ?
      AND c.date BETWEEN ? AND ?
    GROUP BY
      cr.name";

    return $this->db->select($sql, $this->usr->db_id, $in, $from, $to);
  }

  public function getSecr($in, $out) {
    if(!$this->usr->canAnaliz()) return array();

    $in = intval($in);
    $out = intval($out);

    $amnt = $this->getStorage(0);
    $amnt = $amnt[0]['out_amount'];

    $secr = array();
    $cnt = 0;
    while($cnt < 36 && $amnt >= 0) {
      $amnt = $amnt + $in - $out;
      $secr[] = array('tname'=> date("Y-m", strtotime("+".$cnt." months")) , 'amount'=>$amnt);

      $cnt++;
    }

    return $secr;
  }
}
?>

